#ifndef DB_H
#define DB_H

#include <string>
#include <tuple>
#include <mysql/mysql.h>

struct SQLConnection {
    std::string server;
    std::string user;
    std::string password;
    std::string database;

    SQLConnection(std::string server, std::string user, std::string password, std::string database);
};

struct QueryResult {
    bool success;
    MYSQL_RES* res;
};

std::tuple<bool, MYSQL*> sqlConnectionSetup(const SQLConnection& mysql_details);

QueryResult execSQLQuery(MYSQL* connection, const std::string& query);
#endif // DB_H
