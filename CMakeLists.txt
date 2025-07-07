cmake_minimum_required(VERSION 3.15)
project(Tuturis)

set(CMAKE_CXX_STANDARD 17)

add_subdirectory(external/jossnet-core)

add_executable(tuturis_server server/main.cpp)
target_link_libraries(tuturis_server PRIVATE jossnet-core)
target_include_directories(tuturis_server PRIVATE external/jossnet-core/include)

add_executable(tuturis_client client/main.cpp)
target_link_libraries(tuturis_client PRIVATE jossnet-core)
target_include_directories(tuturis_client PRIVATE external/jossnet-core/include)
