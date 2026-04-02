#ifndef KADEMICS_NEXUS_H
#define KADEMICS_NEXUS_H
#include "../lib/mongoose.h"
#include "database.h"
#include <stdbool.h>
#define MAX_WS_CLIENTS 200
typedef struct { struct mg_connection *c; char roll[20]; char room[50]; bool is_active; } NexusClient;
extern NexusClient g_clients[MAX_WS_CLIENTS];
extern int g_client_count;
void nexus_ws_open(struct mg_connection *c, KDB *db);
void nexus_ws_message(struct mg_connection *c, struct mg_ws_message *wm, KDB *db);
void nexus_ws_close(struct mg_connection *c);
void handle_nexus_rooms(struct mg_connection *c, struct mg_http_message *hm, KDB *db);
void handle_nexus_history(struct mg_connection *c, struct mg_http_message *hm, KDB *db);
void handle_nexus_upload(struct mg_connection *c, struct mg_http_message *hm, KDB *db);
#endif
