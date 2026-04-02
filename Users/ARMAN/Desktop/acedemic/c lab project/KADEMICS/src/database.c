#include "../include/database.h"
#include <stdio.h>

bool db_init(KDB *db) {
    return true; // Dummy implementation
}

bool db_create_schema(KDB *db) {
    return true; // Dummy implementation
}

void db_close(KDB *db) {
}

void db_log(const char *module, const char *message) {
    printf("[DB LOG %s] %s\n", module, message);
}
