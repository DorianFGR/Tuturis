cmake_minimum_required(VERSION 3.15)
project(Tuturis)

cmake_policy(SET CMP0167 NEW)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Boost REQUIRED COMPONENTS system asio)

add_executable(tuturis_client client/main.cpp)
target_link_libraries(tuturis_client PRIVATE Boost::system Boost::asio)

add_executable(tuturis_server server/main.cpp)
target_link_libraries(tuturis_server PRIVATE Boost::system Boost::asio)

if (WIN32)
    target_link_libraries(tuturis_client PRIVATE ws2_32)
    target_link_libraries(tuturis_server PRIVATE ws2_32)
endif()
