#include <iostream>
#include "db_utils.h"
#include "db.h"
#include "dotenv.h"
#include <string>
#include <random>
#include <iomanip>
#include <argon2.h>
#include <memory>

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

std::string urlDecode(const std::string& str) {
    std::ostringstream decoded;
    for (size_t i = 0; i < str.length(); ++i) {
        if (str[i] == '%' && i + 2 < str.length()) {
            std::string hex = str.substr(i + 1, 2);
            char decodedChar = static_cast<char>(std::stoi(hex, nullptr, 16));
            decoded << decodedChar;
            i += 2;
        } else if (str[i] == '+') {
            decoded << ' ';
        } else {
            decoded << str[i];
        }
    }
    return decoded.str();
}

bool verifyPassword(const std::string& username, const std::string& password, const std::string& storedHash) {
    int result = argon2_verify(
        storedHash.c_str(),
        password.c_str(), password.size(),
        Argon2_id
    );

    if (result == ARGON2_OK) {
        return true;
    } else {
        std::cerr << "Wrong Password for user : " << username << argon2_error_message(result) << std::endl;
        return false;
    }
}

std::string getUserID(MYSQL* con, const std::string& username) {

    while (mysql_more_results(con)) {
        mysql_next_result(con);
    }

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[1];
    MYSQL_BIND result_bind[1];
    memset(bind, 0, sizeof(bind));
    memset(result_bind, 0, sizeof(result_bind));

    const char* query = "SELECT id FROM users WHERE username = ?";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return "";
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)username.c_str();
    bind[0].buffer_length = username.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    char id_buffer[1024];
    unsigned long id_length;
    result_bind[0].buffer_type = MYSQL_TYPE_STRING;
    result_bind[0].buffer = id_buffer;
    result_bind[0].buffer_length = sizeof(id_buffer);
    result_bind[0].length = &id_length;

    if (mysql_stmt_bind_result(stmt, result_bind)) {
        std::cerr << "mysql_stmt_bind_result() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    int fetch_result = mysql_stmt_fetch(stmt);
    if (fetch_result == MYSQL_NO_DATA) {
        std::cerr << "User not found\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (fetch_result != 0) {
        std::cerr << "mysql_stmt_fetch() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    std::string user_id(id_buffer, id_length);

    mysql_stmt_free_result(stmt);
    mysql_stmt_close(stmt);

    return user_id;
}

bool createSession(MYSQL* con, const std::string& username, const std::string& token) {

    std::string userID = getUserID(con, username);

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[2];
    memset(bind, 0, sizeof(bind));

    const char* query = "INSERT INTO sessions (userID, token) VALUES (?, ?)";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return false;
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)userID.c_str();
    bind[0].buffer_length = userID.length();

    bind[1].buffer_type = MYSQL_TYPE_STRING;
    bind[1].buffer = (void*)token.c_str();
    bind[1].buffer_length = token.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    mysql_stmt_close(stmt);

    return true;
}

std::string getHashedPassword(MYSQL* con, const std::string& username) {

    while (mysql_more_results(con)) {
        mysql_next_result(con);
    }

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[1];
    MYSQL_BIND result_bind[1];
    memset(bind, 0, sizeof(bind));
    memset(result_bind, 0, sizeof(result_bind));

    const char* query = "SELECT password FROM users WHERE username = ?";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return "";
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)username.c_str();
    bind[0].buffer_length = username.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    char password_buffer[1024];
    unsigned long password_length;
    result_bind[0].buffer_type = MYSQL_TYPE_STRING;
    result_bind[0].buffer = password_buffer;
    result_bind[0].buffer_length = sizeof(password_buffer);
    result_bind[0].length = &password_length;

    if (mysql_stmt_bind_result(stmt, result_bind)) {
        std::cerr << "mysql_stmt_bind_result() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    int fetch_result = mysql_stmt_fetch(stmt);
    if (fetch_result == MYSQL_NO_DATA) {
        std::cerr << "User not found\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (fetch_result != 0) {
        std::cerr << "mysql_stmt_fetch() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    std::string hash(password_buffer, password_length);

    mysql_stmt_free_result(stmt);
    mysql_stmt_close(stmt);

    return hash;
}

bool loginAttempt(MYSQL* connection, const std::string& username, const std::string& password, const std::string& token) {
    const std::string hashedPassword = getHashedPassword(connection, username);

    if (hashedPassword.empty()) {
        std::cerr << "Failed to retrieve hashed password for user: " << username << "\n";
        return false;
    }

    if (verifyPassword(username, password, hashedPassword)) {
        std::cout << "Login successful for user: " << username << "\n";
        getConnectedUser(connection,"Iv5kBTE3BM3ImyoXZprUWRTdSv0PBsqy");
        createSession(connection, username, token);
        return true;
    } else {
        std::cerr << "Login failed for user: " << username << "\n";
        return false;
    }
}


bool prepareCreateUser(MYSQL* con, const std::string& id, const std::string& username, const std::string& email, const std::string& hashedPassword) {
    MYSQL_STMT* stmt;
    MYSQL_BIND bind[4];
    memset(bind, 0, sizeof(bind));

    const char* query = "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return false;
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)id.c_str();
    bind[0].buffer_length = id.length();

    bind[1].buffer_type = MYSQL_TYPE_STRING;
    bind[1].buffer = (void*)username.c_str();
    bind[1].buffer_length = username.length();

    bind[2].buffer_type = MYSQL_TYPE_STRING;
    bind[2].buffer = (void*)email.c_str();
    bind[2].buffer_length = email.length();

    bind[3].buffer_type = MYSQL_TYPE_STRING;
    bind[3].buffer = (void*)hashedPassword.c_str();
    bind[3].buffer_length = hashedPassword.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    mysql_stmt_close(stmt);
    return true;
}



bool createUser(MYSQL* connection, const std::string& username, const std::string& email, const std::string& password) {
    auto& dotenv = dotenv::env.load_dotenv();

    const char* host = dotenv["MYSQL_HOST"].c_str();
    const char* user = dotenv["MYSQL_USER"].c_str();
    const char* db_password = dotenv["MYSQL_PASSWORD"].c_str();
    const char* database = dotenv["MYSQL_DATABASE"].c_str();

    std::string decodedMail = urlDecode(email);
    std::string decodedUsername = urlDecode(username);

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

    const std::string id = generate_random_string(16);

    bool insertionSuccess = prepareCreateUser(con, id, decodedUsername, decodedMail, hashed);
    if (!insertionSuccess) {
        std::cerr << "Prepared statement failed.\n";
        mysql_close(con);
        return false;
    }

    std::cout << "User '" << username << "' successfully added to the database.\n";

    mysql_close(con);
    return true;
}

std::string getUserIDFromToken(MYSQL* con, const std::string& token) {

    while (mysql_more_results(con)) {
        mysql_next_result(con);
    }

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[1];
    MYSQL_BIND result_bind[1];
    memset(bind, 0, sizeof(bind));
    memset(result_bind, 0, sizeof(result_bind));

    const char* query = "SELECT userID FROM sessions WHERE token = ?";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return "";
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)token.c_str();
    bind[0].buffer_length = token.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    char userID_buffer[1024];
    unsigned long userID_length;
    result_bind[0].buffer_type = MYSQL_TYPE_STRING;
    result_bind[0].buffer = userID_buffer;
    result_bind[0].buffer_length = sizeof(userID_buffer);
    result_bind[0].length = &userID_length;

    if (mysql_stmt_bind_result(stmt, result_bind)) {
        std::cerr << "mysql_stmt_bind_result() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    int fetch_result = mysql_stmt_fetch(stmt);
    if (fetch_result == MYSQL_NO_DATA) {
        std::cerr << "User not found\n";
        mysql_stmt_close(stmt);
        return "";
    }

    if (fetch_result != 0) {
        std::cerr << "mysql_stmt_fetch() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return "";
    }

    std::string userID(userID_buffer, userID_length);

    mysql_stmt_free_result(stmt);
    mysql_stmt_close(stmt);

    std::cout << "User ID: " << userID << "\n";

    return userID;

}

connectedUser getConnectedUser(MYSQL* con, const std::string& token) {
    connectedUser user;

    std::string id = getUserIDFromToken(con, token);
    if (id.empty()) {
        std::cerr << "Invalid token: no user found.\n";
        return user;
    }

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[1];
    MYSQL_BIND result_bind[3];
    memset(bind, 0, sizeof(bind));
    memset(result_bind, 0, sizeof(result_bind));

    const char* query = "SELECT username, email, created_at FROM users WHERE id = ?";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return user;
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return user;
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)id.c_str();
    bind[0].buffer_length = id.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return user;
    }

    char username_buf[256], email_buf[256], created_at_buf[256];
    unsigned long username_len, email_len, created_at_len;

    result_bind[0].buffer_type = MYSQL_TYPE_STRING;
    result_bind[0].buffer = username_buf;
    result_bind[0].buffer_length = sizeof(username_buf);
    result_bind[0].length = &username_len;

    result_bind[1].buffer_type = MYSQL_TYPE_STRING;
    result_bind[1].buffer = email_buf;
    result_bind[1].buffer_length = sizeof(email_buf);
    result_bind[1].length = &email_len;

    result_bind[2].buffer_type = MYSQL_TYPE_STRING;
    result_bind[2].buffer = created_at_buf;
    result_bind[2].buffer_length = sizeof(created_at_buf);
    result_bind[2].length = &created_at_len;

    if (mysql_stmt_bind_result(stmt, result_bind)) {
        std::cerr << "mysql_stmt_bind_result() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return user;
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return user;
    }

    int fetch_result = mysql_stmt_fetch(stmt);
    if (fetch_result == MYSQL_NO_DATA) {
        std::cerr << "User not found for ID: " << id << "\n";
    } else if (fetch_result == 0) {
        user.username = std::string(username_buf, username_len);
        user.email = std::string(email_buf, email_len);
        user.created_at = std::string(created_at_buf, created_at_len);
    } else {
        std::cerr << "mysql_stmt_fetch() failed: " << mysql_stmt_error(stmt) << "\n";
    }

    mysql_stmt_close(stmt);
    std::cout << "Connected user: " << user.username << ", Email: " << user.email << ", Created at: " << user.created_at << "\n";
    return user;
}

bool delSessionfromDB(MYSQL* con, const std::string& token) {

    MYSQL_STMT* stmt;
    MYSQL_BIND bind[1];
    memset(bind, 0, sizeof(bind));

    const char* query = "DELETE FROM sessions WHERE token = ?";
    stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return false;
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = (void*)token.c_str();
    bind[0].buffer_length = token.length();

    if (mysql_stmt_bind_param(stmt, bind)) {
        std::cerr << "mysql_stmt_bind_param() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return false;
    }

    mysql_stmt_close(stmt);
    return true;
}

std::vector<ListedUser> getAllUsers(MYSQL* con) {
    std::vector<ListedUser> users;

    while (mysql_more_results(con)) {
        mysql_next_result(con);
    }

    const char* query = "SELECT id, username, email, created_at FROM users";

    MYSQL_STMT* stmt = mysql_stmt_init(con);
    if (!stmt) {
        std::cerr << "mysql_stmt_init() failed\n";
        return users;
    }

    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        std::cerr << "mysql_stmt_prepare() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return users;
    }

    MYSQL_BIND result[4];
    memset(result, 0, sizeof(result));

    char id_buffer[64], username_buffer[64], email_buffer[128], created_buffer[64];
    unsigned long id_len, username_len, email_len, created_len;

    result[0].buffer_type = MYSQL_TYPE_STRING;
    result[0].buffer = id_buffer;
    result[0].buffer_length = sizeof(id_buffer);
    result[0].length = &id_len;

    result[1].buffer_type = MYSQL_TYPE_STRING;
    result[1].buffer = username_buffer;
    result[1].buffer_length = sizeof(username_buffer);
    result[1].length = &username_len;

    result[2].buffer_type = MYSQL_TYPE_STRING;
    result[2].buffer = email_buffer;
    result[2].buffer_length = sizeof(email_buffer);
    result[2].length = &email_len;

    result[3].buffer_type = MYSQL_TYPE_STRING;
    result[3].buffer = created_buffer;
    result[3].buffer_length = sizeof(created_buffer);
    result[3].length = &created_len;

    if (mysql_stmt_bind_result(stmt, result)) {
        std::cerr << "mysql_stmt_bind_result() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return users;
    }

    if (mysql_stmt_execute(stmt)) {
        std::cerr << "mysql_stmt_execute() failed: " << mysql_stmt_error(stmt) << "\n";
        mysql_stmt_close(stmt);
        return users;
    }

    while (mysql_stmt_fetch(stmt) == 0) {
        ListedUser user;
        user.id = std::string(id_buffer, id_len);
        user.username = std::string(username_buffer, username_len);
        user.email = std::string(email_buffer, email_len);
        user.created_at = std::string(created_buffer, created_len);
        users.push_back(user);
    }

    mysql_stmt_free_result(stmt);
    mysql_stmt_close(stmt);
    return users;
}
