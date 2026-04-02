/*
 * ============================================================
 * KADEMICS — main.c
 * The Core Kernel: Mongoose HTTP + WebSocket Server
 *
 * Boots the server, initializes SQLite3, and routes all
 * incoming HTTP requests to the correct sub-module handler.
 *
 * Architecture:
 *   Browser (HTML/CSS/JS) ←→ Mongoose HTTP Server (C)
 *                                    ↓
 *         auth.c | notes.c | oracle.c | gauntlet.c | nexus.c | search.c
 *                                    ↓
 *                            SQLite3 (database.c)
 * ============================================================
 */

/* Enable WebSocket support in Mongoose */
#define MG_ENABLE_WEBSOCKET 1

#include "../lib/mongoose.h"
#include "../include/database.h"
#include "../include/auth.h"
#include "../include/notes.h"
#include "../include/oracle.h"
#include "../include/gauntlet.h"
#include "../include/nexus.h"
#include "../include/search.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ── Configuration ──────────────────────────────────────── */
#define SERVER_PORT   "http://0.0.0.0:8080"
#define WEB_ROOT      "web"

/* ── Global Database Handle ─────────────────────────────── */
static KDB g_kdb;

/* ── Utility: match URI prefix ──────────────────────────── */
static int uri_starts(struct mg_http_message *hm, const char *prefix) {
    return mg_http_match_uri(hm, prefix);
}

/* Helper: get session token from Cookie header */
static void get_session_token(struct mg_http_message *hm, char *token, int maxlen) {
    struct mg_str cookie = mg_http_get_header_var(
        mg_http_get_header(hm, "Cookie"), mg_str("kademics_session"));
    if (cookie.len > 0) {
        size_t n = cookie.len < (size_t)(maxlen-1) ? cookie.len : (size_t)(maxlen-1);
        strncpy(token, cookie.buf, n);
        token[n] = '\0';
    } else {
        token[0] = '\0';
    }
}

/* ── POST /api/auth/login ───────────────────────────────── */
static void handle_auth_login(struct mg_connection *c, struct mg_http_message *hm) {
    char body[1024] = {0};
    size_t blen = hm->body.len < 1023 ? hm->body.len : 1023;
    strncpy(body, hm->body.buf, blen);

    char email[100] = {0}, name[100] = "KIIT Student";
    /* Extract email and name from JSON body */
    char *p = strstr(body, "\"email\":\"");
    if (p) { p+=9; int i=0; while(*p&&*p!='"'&&i<99) email[i++]=*p++; email[i]='\0'; }
    p = strstr(body, "\"name\":\"");
    if (p) { p+=8; int i=0; while(*p&&*p!='"'&&i<99) name[i++]=*p++;  name[i]='\0';  }

    /* If no name given, use roll number as name */
    char roll[20] = {0};
    extract_roll_number(email, roll);
    if (strlen(name) == 0 || strcmp(name, "KIIT Student") == 0) {
        snprintf(name, sizeof(name), "Student_%s", roll);
    }

    char token[TOKEN_LEN] = {0};
    UserProfile profile = {0};
    if (!auth_login(&g_kdb, email, name, token, &profile)) {
        mg_http_reply(c, 401,
                      "Content-Type: application/json\r\n",
                      "{\"success\":false,\"error\":"
                      "\"[ERROR: AUTHENTICATION UPLINK DENIED. USE @kiit.ac.in EMAIL]\"}");
        return;
    }

    /* Set session cookie (24h) */
    char cookie_hdr[256];
    snprintf(cookie_hdr, sizeof(cookie_hdr),
             "Set-Cookie: kademics_session=%s; Path=/; Max-Age=86400\r\n"
             "Content-Type: application/json\r\n"
             "Access-Control-Allow-Origin: *\r\n",
             token);
    mg_http_reply(c, 200, cookie_hdr,
                  "{\"success\":true,\"roll\":\"%s\",\"name\":\"%s\","
                  "\"rank\":\"%s\",\"token\":\"%s\"}",
                  profile.roll_no, profile.full_name,
                  profile.rank_title, token);
}

/* ── GET /api/auth/me ───────────────────────────────────── */
static void handle_auth_me(struct mg_connection *c, struct mg_http_message *hm) {
    char token[TOKEN_LEN] = {0};
    get_session_token(hm, token, sizeof(token));

    /* Also check Authorization header */
    if (strlen(token) == 0) {
        struct mg_str auth = mg_http_get_header_var(
            mg_http_get_header(hm, "Authorization"), mg_str("Bearer"));
        if (auth.len > 0) {
            size_t n = auth.len < TOKEN_LEN-1 ? auth.len : TOKEN_LEN-1;
            strncpy(token, auth.buf, n);
            token[n] = '\0';
        }
    }

    UserProfile profile = {0};
    if (!auth_get_user(&g_kdb, token, &profile)) {
        mg_http_reply(c, 401, "Content-Type: application/json\r\n",
                      "{\"authenticated\":false}");
        return;
    }
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"authenticated\":true,\"roll\":\"%s\",\"name\":\"%s\",\"rank\":\"%s\"}",
                  profile.roll_no, profile.full_name, profile.rank_title);
}

/* ── POST /api/auth/logout ──────────────────────────────── */
static void handle_auth_logout(struct mg_connection *c, struct mg_http_message *hm) {
    char token[TOKEN_LEN] = {0};
    get_session_token(hm, token, sizeof(token));
    auth_logout(&g_kdb, token);
    mg_http_reply(c, 200,
                  "Set-Cookie: kademics_session=; Path=/; Max-Age=0\r\n"
                  "Content-Type: application/json\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: SESSION TERMINATED.\"}");
}

/* ── Handle CORS preflight ──────────────────────────────── */
static void handle_cors(struct mg_connection *c) {
    mg_http_reply(c, 200,
                  "Access-Control-Allow-Origin: *\r\n"
                  "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n"
                  "Access-Control-Allow-Headers: Content-Type, Authorization\r\n",
                  "");
}

/* ── Main Event Handler ─────────────────────────────────── */
static void event_handler(struct mg_connection *c, int ev, void *ev_data) {
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *)ev_data;

        /* ── CORS preflight ───────────────────────────── */
        if (mg_match(hm->method, mg_str("OPTIONS"), NULL)) {
            handle_cors(c); return;
        }

        /* ── WebSocket upgrade: /ws/chat ─────────────── */
        if (mg_http_match_uri(hm, "/ws/chat")) {
            mg_ws_upgrade(c, hm, NULL);
            nexus_ws_open(c, &g_kdb);
            return;
        }

        /* ─────────────────────────────────────────────── */
        /* AUTH ROUTES                                      */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/auth/login"))  { handle_auth_login (c, hm); return; }
        if (mg_http_match_uri(hm, "/api/auth/me"))     { handle_auth_me    (c, hm); return; }
        if (mg_http_match_uri(hm, "/api/auth/logout")) { handle_auth_logout(c, hm); return; }

        /* ─────────────────────────────────────────────── */
        /* SEARCH (Parallel Threads)                        */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/search")) {
            handle_parallel_search(c, hm, &g_kdb); return;
        }

        /* ─────────────────────────────────────────────── */
        /* NOTES (Aether Archive)                           */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/notes/courses"))    { handle_get_courses (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/branches"))   { handle_get_branches(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/years"))      { handle_get_years   (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/subjects"))   { handle_get_subjects(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/teachers"))   { handle_get_teachers(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/files"))      { handle_get_notes   (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/download"))   { handle_download_note(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/add-course"))  { handle_add_course  (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/add-branch"))  { handle_add_branch  (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/add-year"))    { handle_add_year    (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/add-subject")) { handle_add_subject (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/add-teacher")) { handle_add_teacher (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/notes/upload"))      { handle_upload_note (c, hm, &g_kdb); return; }

        /* ─────────────────────────────────────────────── */
        /* ORACLE (Teacher Ratings)                         */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/oracle/teachers"))    { handle_oracle_teachers   (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/teacher"))     { handle_oracle_dossier    (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/sections"))    { handle_oracle_sections   (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/comments"))    { handle_oracle_comments   (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/add-teacher")) { handle_oracle_add_teacher(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/add-section")) { handle_oracle_add_section(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/comment"))     { handle_oracle_comment    (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/oracle/rate"))        { handle_oracle_rate       (c, hm, &g_kdb); return; }

        /* ─────────────────────────────────────────────── */
        /* GAUNTLET (Quizzes)                               */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/gauntlet/quizzes"))       { handle_get_quizzes       (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/verify"))        { handle_verify_quiz       (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/questions"))     { handle_get_questions     (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/submit"))        { handle_submit_quiz       (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/proctor/switch")){ handle_log_switch        (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/results"))       { handle_get_my_result     (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/host-results"))  { handle_host_results      (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/export"))        { handle_export_csv        (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/create-quiz"))   { handle_create_quiz       (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/add-question"))  { handle_add_question      (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/gauntlet/update-status")) { handle_update_quiz_status(c, hm, &g_kdb); return; }

        /* ─────────────────────────────────────────────── */
        /* NEXUS (Communities / Chat)                       */
        /* ─────────────────────────────────────────────── */
        if (mg_http_match_uri(hm, "/api/nexus/rooms"))   { handle_nexus_rooms  (c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/nexus/history")) { handle_nexus_history(c, hm, &g_kdb); return; }
        if (mg_http_match_uri(hm, "/api/nexus/upload"))  { handle_nexus_upload (c, hm, &g_kdb); return; }

        /* ─────────────────────────────────────────────── */
        /* STATIC FILE SERVING (HTML/CSS/JS/Assets)         */
        /* ─────────────────────────────────────────────── */
        struct mg_http_serve_opts opts = {0};
        opts.root_dir = WEB_ROOT;
        opts.ssi_pattern = "#"; /* Disable SSI */
        mg_http_serve_dir(c, hm, &opts);

    } else if (ev == MG_EV_WS_MSG) {
        /* ── WebSocket message ────────────────────────── */
        struct mg_ws_message *wm = (struct mg_ws_message *)ev_data;
        nexus_ws_message(c, wm, &g_kdb);

    } else if (ev == MG_EV_CLOSE) {
        /* ── Connection closed ────────────────────────── */
        if (c->is_websocket) nexus_ws_close(c);
    }
}

/* ── Entry Point ─────────────────────────────────────────── */
int main(void) {
    /* ── Boot Sequence Display ──────────────────────────── */
    printf("\n");
    printf("  ██╗  ██╗ █████╗ ██████╗ ███████╗███╗   ███╗██╗ ██████╗███████╗\n");
    printf("  ██║ ██╔╝██╔══██╗██╔══██╗██╔════╝████╗ ████║██║██╔════╝██╔════╝\n");
    printf("  █████╔╝ ███████║██║  ██║█████╗  ██╔████╔██║██║██║     ███████╗\n");
    printf("  ██╔═██╗ ██╔══██║██║  ██║██╔══╝  ██║╚██╔╝██║██║██║     ╚════██║\n");
    printf("  ██║  ██╗██║  ██║██████╔╝███████╗██║ ╚═╝ ██║██║╚██████╗███████║\n");
    printf("  ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝ ╚═════╝╚══════╝\n");
    printf("\n  [SYSTEM BOOT] Initializing Central Intelligence Nexus...\n\n");

    /* ── Initialize SQLite3 Database ───────────────────── */
    printf("  [DATA VAULT]  Opening SQLite3 database: %s\n", DB_PATH);
    if (!db_init(&g_kdb)) {
        fprintf(stderr, "  [FATAL] Database initialization failed. Aborting.\n");
        return 1;
    }
    if (!db_create_schema(&g_kdb)) {
        fprintf(stderr, "  [FATAL] Schema creation failed. Aborting.\n");
        db_close(&g_kdb);
        return 1;
    }
    printf("  [DATA VAULT]  Schema initialized. KIIT seed data loaded.\n");

    /* ── Initialize Nexus Client Registry ──────────────── */
    memset(g_clients, 0, sizeof(g_clients));
    g_client_count = 0;
    printf("  [NEXUS]       WebSocket client registry initialized.\n");

    /* ── Start Mongoose HTTP Server ─────────────────────── */
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);

    struct mg_connection *conn = mg_http_listen(&mgr, SERVER_PORT, event_handler, NULL);
    if (!conn) {
        fprintf(stderr, "  [FATAL] Failed to bind on %s\n", SERVER_PORT);
        db_close(&g_kdb);
        mg_mgr_free(&mgr);
        return 1;
    }

    printf("  [SERVER]      HTTP + WebSocket server running on %s\n", SERVER_PORT);
    printf("  [ARCHIVE]     Serving static files from ./%s/\n", WEB_ROOT);
    printf("\n  >> Open browser at: http://localhost:8080\n");
    printf("  >> Admin log: %s\n\n", LOG_PATH);
    printf("  [SYSTEM]      All systems nominal. Awaiting uplinks...\n\n");

    db_log("SYSTEM", "KADEMICS server started on port 8080");

    /* ── Main Event Loop ────────────────────────────────── */
    while (1) {
        mg_mgr_poll(&mgr, 1000); /* Poll every 1 second */
    }

    /* ── Cleanup (never reached in normal operation) ────── */
    db_close(&g_kdb);
    mg_mgr_free(&mgr);
    return 0;
}
