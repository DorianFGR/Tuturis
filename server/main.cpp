#include <boost/asio.hpp>
#include <iostream>
#include "db.h"

using boost::asio::ip::tcp;
int port = 2008;

int main() {

    bool sucess;
    MYSQL *con;
    MYSQL_ROW row;

    struct SQLConnection sqlDetails("localhost", "root", "", "tuturis");

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
