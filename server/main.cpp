#include <boost/asio.hpp>
#include <iostream>
#include <cstdlib>
#include "db.h"
#include "dotenv.h"


using namespace std;
using boost::asio::ip::tcp;
int port = 2008;

int main() {

    auto& dotenv = dotenv::env.load_dotenv();

    const char* host = dotenv["MYSQL_HOST"].c_str();
    const char* user = dotenv["MYSQL_USER"].c_str();
    const char* password = dotenv["MYSQL_PASSWORD"].c_str();
    const char* database = dotenv["MYSQL_DATABASE"].c_str();

    bool sucess;
    MYSQL *con;
    MYSQL_ROW row;

    struct SQLConnection sqlDetails( host, user, password, database);

    std::tie(sucess, con) = sqlConnectionSetup(sqlDetails);

    if (!sucess) {

        return 1;
    }

    auto result = execSQLQuery(con, "SELECT * FROM users");

    if (!result.success) {
        return 1;
    }

    std::cout << "Database output :\n" << std::endl;

    while ((row = mysql_fetch_row(result.res)) != NULL) {
        std::cout << "ID: " << row[0] << ", Name: " << row[1] << ", Email: " << row[2] << std::endl;
    }

    mysql_free_result(result.res);
    mysql_close(con);
    /*
    try {
        boost::asio::io_context io;

        tcp::acceptor acceptor(io, tcp::endpoint(tcp::v4(), port));

        std::cout << "Tuturis is listening on port : "<< port << std::endl;
        std::cout << "Tuturis server is up waiting for clients" << std::endl;

        for (;;) {
            tcp::socket socket(io);
            acceptor.accept(socket);

            std::string client_ip = socket.remote_endpoint().address().to_string();
            unsigned short port = socket.remote_endpoint().port();
            std::cout << client_ip << ":" << port << " is now connected to the server" << std::endl;

            std::string message = "Welcome on Tuturis server!\n";
            boost::system::error_code ignored_error;
            boost::asio::write(socket, boost::asio::buffer(message), ignored_error);

            std::cout << "Message sent to client" << std::endl;
        }

    } catch (std::exception& e) {
        std::cerr << "Error : " << e.what() << std::endl;
    }
    */
    return 0;
}
