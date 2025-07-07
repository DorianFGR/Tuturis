cmake_minimum_required(VERSION 3.15)
project(Tuturis)

cmake_policy(SET CMP0167 NEW)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Boost 1.66 REQUIRED COMPONENTS system)

message(STATUS "Boost include dirs: ${Boost_INCLUDE_DIRS}")
message(STATUS "Boost libraries: ${Boost_LIBRARIES}")

include_directories(${Boost_INCLUDE_DIRS})
link_directories(${Boost_LIBRARY_DIRS})

# Client
add_executable(tuturis_client client/main.cpp)
target_link_libraries(tuturis_client PRIVATE ${Boost_LIBRARIES})

# Server
add_executable(tuturis_server server/main.cpp)
target_link_libraries(tuturis_server PRIVATE ${Boost_LIBRARIES})
