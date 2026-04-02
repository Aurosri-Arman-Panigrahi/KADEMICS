#include "../include/nexus.h"
#include <string.h>
#include <stdio.h>

NexusClient g_clients[MAX_WS_CLIENTS];
int g_client_count = 0;

void nexus_ws_open(struct mg_connection *c, KDB *db) {
    if (g_client_count < MAX_WS_CLIENTS) {
        g_clients[g_client_count].c = c;
        g_clients[g_client_count].is_active = true;
        g_client_count++;
    }
}

void nexus_ws_message(struct mg_connection *c, struct mg_ws_message *wm, KDB *db) {
    for(int i = 0; i < g_client_count; i++) {
        if (g_clients[i].is_active && g_clients[i].c != NULL) {
            mg_ws_send(g_clients[i].c, wm->data.buf, wm->data.len, WEBSOCKET_OP_TEXT);
        }
    }
}

void nexus_ws_close(struct mg_connection *c) {
    for(int i = 0; i < g_client_count; i++) {
        if (g_clients[i].c == c) {
            g_clients[i].is_active = false;
            g_clients[i].c = NULL;
        }
    }
}

void handle_nexus_rooms(struct mg_connection *c, struct mg_http_message *hm, KDB *db) {
    const char *mock_rooms = "["
        "{\"room\":\"cse-1st-year\",\"teacher\":\"1st Year CSE\",\"subject\":\"All 1st Year Subjects\"},"
        "{\"room\":\"pps-c-lab\",\"teacher\":\"PPS / C Lab Discussion\",\"subject\":\"Programming & Problem Solving\"}"
    "]";
    mg_http_reply(c, 200, "Content-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\n", "%s", mock_rooms);
}

void handle_nexus_history(struct mg_connection *c, struct mg_http_message *hm, KDB *db) {
    mg_http_reply(c, 200, "Content-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\n", "[]");
}

void handle_nexus_upload(struct mg_connection *c, struct mg_http_message *hm, KDB *db) {
    mg_http_reply(c, 200, "Content-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\n", "{\"success\":true}");
}
