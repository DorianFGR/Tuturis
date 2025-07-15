#include "httpServer.h"
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/asio.hpp>
#include <iostream>
#include <fstream>
#include "db_utils.h"
#include "db.h"
#include "dotenv.h"
#include <unordered_map>
#include <sstream>


namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using tcp = net::ip::tcp;

std::string read_file(const std::string& path) {
    std::ifstream file(path);
    if (!file) return "<h1>Error : Can't access control panel page</h1>";
    return { std::istreambuf_iterator<char>(file), std::istreambuf_iterator<char>() };
}

std::vector<char> read_binary_file(const std::string& path) {
    std::ifstream file(path, std::ios::binary);
    if (!file) return {};
    return { std::istreambuf_iterator<char>(file), std::istreambuf_iterator<char>() };
}

std::string getFormValue(const std::string& body, const std::string& key) {
    std::string search = key + "=";
    auto start = body.find(search);
    if (start == std::string::npos) return "";
    start += search.size();
    auto end = body.find("&", start);
    return body.substr(start, end - start);
}

std::unordered_map<std::string, std::string> parse_form_data(const std::string& body) {
    std::unordered_map<std::string, std::string> result;
    std::istringstream ss(body);
    std::string pair;

    while (std::getline(ss, pair, '&')) {
        auto pos = pair.find('=');
        if (pos != std::string::npos) {
            std::string key = pair.substr(0, pos);
            std::string value = pair.substr(pos + 1);
            result[key] = value;
        }
    }

    return result;
}

void serve_page(tcp::socket socket) {
    try {
        beast::flat_buffer buffer;
        http::request<http::string_body> req;
        http::read(socket, buffer, req);

        http::response<http::string_body> res;
        res.version(req.version());
        res.keep_alive(false);

        if (req.method() == http::verb::get && req.target() == "/") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/html");
            res.body() = read_file("server/controlPanel/index.html");
        }else if(req.method() == http::verb::get && req.target() == "/login") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/html");
            res.body() = read_file("server/controlPanel/login.html");
        }else if(req.method() == http::verb::get && req.target() == "/administration") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/html");
            res.body() = read_file("server/controlPanel/administration/index.html");
        }else if(req.method() == http::verb::get && req.target() == "/administration/users") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/html");
            res.body() = read_file("server/controlPanel/administration/users.html");
        }else if(req.method() == http::verb::get && req.target() == "/administration/createUser") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/html");
            res.body() = read_file("server/controlPanel/administration/createUser.html");
        }else if(req.method() == http::verb::get && req.target() == "/styles/login.css") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/css");
            res.body() = read_file("server/controlPanel/styles/login.css");
        }else if(req.method() == http::verb::get && req.target() == "/styles/board.css") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/css");
            res.body() = read_file("server/controlPanel/styles/board.css");
        }else if(req.method() == http::verb::get && req.target() == "/styles/administration.css") {
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/css");
            res.body() = read_file("server/controlPanel/styles/administration.css");
        } else if (req.method() == http::verb::get && req.target() == "/img/user.webp") {
            std::vector<char> image = read_binary_file("server/controlPanel/img/user.webp");

            http::response<http::vector_body<char>> res_img{ http::status::ok, req.version() };
            res_img.set(http::field::content_type, "image/webp");
            res_img.content_length(image.size());
            res_img.body() = std::move(image);
            res_img.prepare_payload();
            http::write(socket, res_img);
            return;
        }else if (req.method() == http::verb::post && req.target() == "/administration/createUserAttempt") {
            std::string body = req.body();

            std::string username = getFormValue(body, "username");
            std::string email = getFormValue(body, "email");
            std::string password = getFormValue(body, "password");

            std::cout << "Received user: " << username << ", " << email << std::endl;

            MYSQL* con;

            createUser(con, username, email, password);
            res.result(http::status::ok);
            res.set(http::field::content_type, "text/plain");
            res.body() = "User created successfully!";
        }else if (req.method() == http::verb::post && req.target() == "/loginAttempt") {
            std::string body = req.body();
            std::string token = generate_random_string(32);


            std::string username = getFormValue(body, "username");
            std::string password = getFormValue(body, "password");

            std::cout << "Received user: " << username << std::endl;

            auto& dotenv = dotenv::env.load_dotenv();
            const char* host = dotenv["MYSQL_HOST"].c_str();
            const char* user = dotenv["MYSQL_USER"].c_str();
            const char* db_password = dotenv["MYSQL_PASSWORD"].c_str();
            const char* database = dotenv["MYSQL_DATABASE"].c_str();

            MYSQL* con;
            bool success;
            std::tie(success, con) = sqlConnectionSetup(SQLConnection(host, user, db_password, database));

            if (!success) {
                res.result(http::status::internal_server_error);
                res.set(http::field::content_type, "text/plain");
                res.body() = "Database connection failed";
            } else {
                bool loginSuccess = loginAttempt(con, username, password, token);
                res.result(http::status::see_other);

                if (loginSuccess) {

                    res.set(http::field::set_cookie, "tuturisSession=" + token + "; HttpOnly; Path=/; Max-Age=3600");
                    res.set(http::field::location, "/");
                    res.set(http::field::content_length, "0");
                    res.keep_alive(req.keep_alive());
                }else {

                    res.body() = "An error occurred during login, please check your credentials. If the problem persists, please contact the administrator.";
                }

                mysql_close(con);
            }
        }else {
            res.result(http::status::not_found);
            res.set(http::field::content_type, "text/plain");
            res.body() = "404 - not found";
        }

        res.prepare_payload();
        http::write(socket, res);
        socket.shutdown(tcp::socket::shutdown_send);
    } catch (const std::exception& e) {
        std::cerr << "Error : " << e.what() << std::endl;
    }
}