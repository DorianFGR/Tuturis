cmake_minimum_required(VERSION 3.15)
project(Tuturis)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)


# Boost
find_package(Boost REQUIRED COMPONENTS system asio)

# MySQL
find_package(unofficial-libmysql CONFIG REQUIRED)

add_executable(tuturis_server
        server/main.cpp
        server/db.cpp
)

target_link_libraries(tuturis_server
        PRIVATE
        Boost::system
        Boost::asio
        unofficial::libmysql::libmysql

)

if (WIN32)
    target_link_libraries(tuturis_server PRIVATE ws2_32)
endif()
