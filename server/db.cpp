#include <iostream>
#include <tuple>
#include <mysql/mysql.h>
#include <mysql/mysqld_error.h>
#include "db.h"

SQLConnection::SQLConnection(std::string server, std::string user, std::string password, std::string database)
    : server(std::move(server)), user(std::move(user)), password(std::move(password)), database(std::move(database)) {}

std::tuple<bool, MYSQL *> sqlConnectionSetup(const SQLConnection& mysql_details) {
    MYSQL *connection = mysql_init(NULL);
    bool success = true;

    if (!mysql_real_connect(connection, mysql_details.server.c_str(), mysql_details.user.c_str(), mysql_details.password.c_str(), mysql_details.database.c_str(), 0, NULL, 0)) {
        success = false;
        std::cout << "Connection Error : " << mysql_error(connection) << std::endl;
    }

    return std::make_tuple(success, connection);
}

QueryResult execSQLQuery(MYSQL* connection, const std::string& query) {
    QueryResult result;
    result.success = true;
    result.res = nullptr;

    if (mysql_query(connection, query.c_str())) {
        result.success = false;
        std::cout << "MySQL Query Error : " << mysql_error(connection) << std::endl;
    } else {
        result.res = mysql_use_result(connection);
    }

    return result;
}