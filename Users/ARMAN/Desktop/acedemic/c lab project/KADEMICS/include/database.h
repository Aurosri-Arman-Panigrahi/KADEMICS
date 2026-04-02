#ifndef KADEMICS_DATABASE_H
#define KADEMICS_DATABASE_H
#include <stdbool.h>
#define DB_PATH "data/kademics.db"
#define LOG_PATH "data/server.log"
typedef struct { void *conn; } KDB;
bool db_init(KDB *db);
bool db_create_schema(KDB *db);
void db_close(KDB *db);
void db_log(const char *module, const char *message);
#endif
