#include <iostream>
#include "db_utils.h"
#include "db.h"
#include "dotenv.h"


bool createUser(MYSQL* connection, const std::string& username, const std::string& email, const std::string& password) {

    auto& dotenv = dotenv::env.load_dotenv();


    const char* host = dotenv["MYSQL_HOST"].c_str();
    const char* user = dotenv["MYSQL_USER"].c_str();
    const char* db_password = dotenv["MYSQL_PASSWORD"].c_str();
    const char* database = dotenv["MYSQL_DATABASE"].c_str();

    bool sucess;
    MYSQL *con;
    MYSQL_ROW row;

    struct SQLConnection sqlDetails( host, user, db_password, database);

    std::tie(sucess, con) = sqlConnectionSetup(sqlDetails);

    if (!sucess) {

        return false;
    }

    auto result = execSQLQuery(con, "INSERT INTO users (username, email, password) VALUES ('" + username + "', '" + email +  "', '" + password + "')");
    if (!result.success) {

        return false;
    }

    std::cout << "User " << username << " succesfully added to the database" << std::endl;

    while ((row = mysql_fetch_row(result.res)) != NULL) {
        std::cout << "ID: " << row[0] << ", Name: " << row[1] << ", Email: " << row[2] << std::endl;
    }

    mysql_free_result(result.res);
    mysql_close(con);
}
