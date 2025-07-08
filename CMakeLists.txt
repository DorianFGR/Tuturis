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

#Dotenv
add_definitions(-DANTLR4CPP_STATIC)
add_subdirectory(external/cpp-dotenv)
target_link_libraries(tuturis_server PRIVATE cpp_dotenv)

target_link_libraries(tuturis_server
        PRIVATE
        Boost::system
        Boost::asio
        unofficial::libmysql::libmysql
        cpp_dotenv

)

if (WIN32)
    target_link_libraries(tuturis_server PRIVATE ws2_32)
endif()
