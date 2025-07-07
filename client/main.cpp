#include <boost/asio.hpp>
#include <iostream>
#include <array>

using boost::asio::ip::tcp;

int main() {
    try {
        boost::asio::io_context io;

        tcp::resolver resolver(io);
        auto endpoints = resolver.resolve("127.0.0.1", "2008");

        tcp::socket socket(io);
        boost::asio::connect(socket, endpoints);

        std::array<char, 128> buf{};
        boost::system::error_code error;

        size_t len = socket.read_some(boost::asio::buffer(buf), error);
        if (!error) {
            std::cout << "Message received from server : ";
            std::cout.write(buf.data(), len);
            std::cout << std::endl;
        } else {
            std::cerr << "Error reading :  " << error.message() << std::endl;
        }

    } catch (std::exception& e) {
        std::cerr << "Exception : " << e.what() << std::endl;
    }

    return 0;
}