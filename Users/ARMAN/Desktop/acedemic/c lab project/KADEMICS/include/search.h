#ifndef KADEMICS_SEARCH_H
#define KADEMICS_SEARCH_H
#include "../lib/mongoose.h"
#include "database.h"
void handle_parallel_search(struct mg_connection *c, struct mg_http_message *hm, KDB *db);
#endif
