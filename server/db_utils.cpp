#include <iostream>
#include "db_utils.h"
#include "db.h"
#include "dotenv.h"
#include <string>
#include <random>
#include <argon2.h>

std::string generate_random_string(size_t length) {
    const std::string characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    std::random_device random_device;
    std::mt19937 generator(random_device());
    std::uniform_int_distribution<> distribution(0, characters.size() - 1);

    std::string random_string;
    for (size_t i = 0; i < length; ++i) {
        random_string += characters[distribution(generator)];
    }

    return random_string;
}

std::string hashPassword(const std::string& password) {
    auto& dotenv = dotenv::env.load_dotenv();
    const char* salt = generate_random_string(32).c_str();

    char encoded[1024] = {0};

    int result = argon2_hash(
        2, 1 << 16, 1,
        password.c_str(), password.size(),
        salt, strlen(salt),
        nullptr, 32,
        encoded, sizeof(encoded),
        Argon2_id,
        ARGON2_VERSION_NUMBER
    );

    if (result != ARGON2_OK) {
        std::cerr << "Argon2 error: " << argon2_error_message(result) << std::endl;
        return "";
    }

    return std::string(encoded);
}


bool createUser(MYSQL* connection, const std::string& username, const std::string& email, const std::string& password) {

    auto& dotenv = dotenv::env.load_dotenv();

    const char* host = dotenv["MYSQL_HOST"].c_str();
    const char* user = dotenv["MYSQL_USER"].c_str();
    const char* db_password = dotenv["MYSQL_PASSWORD"].c_str();
    const char* database = dotenv["MYSQL_DATABASE"].c_str();

    std::string hashed = hashPassword(password);
    if (hashed.empty()) {
        std::cerr << "Password hashing failed, aborting user creation.\n";
        return false;
    }

    MYSQL* con;
    bool success;
    std::tie(success, con) = sqlConnectionSetup(SQLConnection(host, user, db_password, database));

    if (!success) {
        std::cerr << "Connection to MySQL failed, aborting user creation.\n";
        return false;
    }

    std::string query = "INSERT INTO users (username, email, password) VALUES ('" +
                        username + "', '" + email + "', '" + hashed + "')";

    QueryResult result = execSQLQuery(con, query);
    if (!result.success) {
        std::cerr << "Failed to execute query: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return false;
    }

    std::cout << "User '" << username << "' successfully added to the database.\n";

    if (result.res != nullptr) {
        mysql_free_result(result.res);
    }

    mysql_close(con);
    return true;
}
