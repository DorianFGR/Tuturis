cmake_minimum_required(VERSION 3.15)
project(Tuturis)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ===================== Boost ======================
find_package(Boost REQUIRED COMPONENTS system asio beast process)

# ===================== MySQL ======================
find_package(unofficial-libmysql CONFIG REQUIRED)

# ===================== Dotenv =====================
add_definitions(-DANTLR4CPP_STATIC)
add_subdirectory(external/cpp-dotenv)

# ===================== Argon2 =====================
find_package(unofficial-argon2 CONFIG REQUIRED)

# ===================== Executable =====================
add_executable(tuturis_server
        server/main.cpp
        server/db.cpp
        server/httpServer.cpp
        server/httpServer.h
        server/db_utils.cpp
        server/db_utils.h
)

# ===================== Link Libraries =====================
target_link_libraries(tuturis_server
        PRIVATE
        Boost::system
        Boost::asio
        Boost::process
        unofficial::libmysql::libmysql
        cpp_dotenv
        unofficial::argon2::libargon2
)

if (WIN32)
    target_link_libraries(tuturis_server PRIVATE ws2_32)
endif()
