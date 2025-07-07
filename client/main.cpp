#include <iostream>
#include <boost/asio.hpp>
#include <boost/system/error_code.hpp>


int main() {
    boost::asio::io_context io;
    std::cout << "Boost ASIO is ready." << std::endl;
    return 0;
}