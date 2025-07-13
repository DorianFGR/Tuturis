#include <boost/asio.hpp>
#include <iostream>
#include "dotenv.h"
#include "db.h"
#include "httpServer.h"
#include "db_utils.h"




using namespace std;
using boost::asio::ip::tcp;
int port = 2008;
boost::asio::ip::port_type httpPort = 2009;

int main() {

    std::cout << "Starting HTTP server on port " << httpPort << std::endl;

    try {
        net::io_context ioc;
        tcp::acceptor acceptor(ioc, {tcp::v4(), httpPort});

        std::cout << "Server launched : http://localhost:2009\n";

        while (true) {
            tcp::socket socket(ioc);
            acceptor.accept(socket);
            serve_page(std::move(socket));
        }

    } catch (const std::exception& e) {
        std::cerr << "Server error : " << e.what() << std::endl;
        return 1;
    }


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
