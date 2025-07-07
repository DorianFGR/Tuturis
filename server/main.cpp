#include <boost/asio.hpp>
#include <iostream>

using boost::asio::ip::tcp;
int port = 2008;

int main() {
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

    return 0;
}
