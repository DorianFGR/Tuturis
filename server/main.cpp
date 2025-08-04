#include <boost/asio.hpp>
#include <iostream>
#include <thread>
#include <chrono>
#include <cstdlib>
#include "httpServer.h"

using namespace std;
using boost::asio::ip::tcp;
namespace net = boost::asio;

int port = 2008;
boost::asio::ip::port_type httpPort = 2009;

void startNodeServer() {
    std::system("node server/auth-server/index.js");
}

int main() {
    std::cout << "Starting HTTP server on port " << httpPort << std::endl;

    try {
        std::cout << "Starting authentication server" << std::endl;

        std::thread nodeThread(startNodeServer);
        nodeThread.detach();

        std::this_thread::sleep_for(std::chrono::seconds(3));

        net::io_context ioc;
        tcp::acceptor acceptor(ioc, {tcp::v4(), httpPort});

        std::cout << "Server launched: http://localhost:" << httpPort << "\n";

        while (true) {
            tcp::socket socket(ioc);
            acceptor.accept(socket);
            serve_page(std::move(socket));
        }

    } catch (const std::exception& e) {
        std::cerr << "Server error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}