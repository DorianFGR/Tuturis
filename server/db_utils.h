#ifndef DB_UTILS_H
#define DB_UTILS_H

#include <mysql/mysql.h>

class db_utils {

};

struct connectedUser {

    std::string id;
    std::string username;
    std::string email;
    std::string created_at;
};

bool createUser(MYSQL* connection, const std::string& username, const std::string& email, const std::string& password);
bool loginAttempt(MYSQL* con, const std::string& username, const std::string& password, const std::string& token);
std::string getUserID(MYSQL* con, const std::string& username);
std::string generate_random_string(size_t length);
std::string getUserIDFromToken(MYSQL* con, const std::string& token);
connectedUser getConnectedUser(MYSQL* con, const std::string& token);
bool delSessionfromDB(MYSQL* con, const std::string& token);


#endif //DB_UTILS_H
