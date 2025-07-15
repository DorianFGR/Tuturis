#ifndef DB_UTILS_H
#define DB_UTILS_H

#include <mysql/mysql.h>

class db_utils {

};
bool createUser(MYSQL* connection, const std::string& username, const std::string& email, const std::string& password);
bool loginAttempt(MYSQL* con, const std::string& username, const std::string& password);
std::string getUserID(MYSQL* con, const std::string& username);


#endif //DB_UTILS_H
