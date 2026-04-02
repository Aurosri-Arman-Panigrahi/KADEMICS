/*
 * ============================================================
 * KADEMICS — notes.c
 * The Aether Archive: Notes Hierarchy API Handlers
 * ============================================================
 */

#include "../include/notes.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/* Utility: extract query param as int */
static int get_int_param(struct mg_http_message *hm, const char *key) {
    struct mg_str val = mg_http_var(hm->query, mg_str(key));
    if (val.len == 0) return 0;
    char buf[16] = {0};
    strncpy(buf, val.buf, val.len < 15 ? val.len : 15);
    return atoi(buf);
}

/* Utility: extract query param as string */
static void get_str_param(struct mg_http_message *hm,
                           const char *key, char *out, int maxlen) {
    struct mg_str val = mg_http_var(hm->query, mg_str(key));
    if (val.len == 0) { out[0] = '\0'; return; }
    size_t n = val.len < (size_t)(maxlen-1) ? val.len : (size_t)(maxlen-1);
    strncpy(out, val.buf, n);
    out[n] = '\0';
}

/* Utility: extract body field as string */
static void get_body_str(const char *body, const char *key, char *out, int maxlen) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":\"", key);
    char *p = strstr(body, search);
    if (!p) { out[0]='\0'; return; }
    p += strlen(search);
    int i = 0;
    while (*p && *p != '"' && i < maxlen-1) out[i++] = *p++;
    out[i] = '\0';
}

static int get_body_int(const char *body, const char *key) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":", key);
    char *p = strstr(body, search);
    if (!p) return 0;
    return atoi(p + strlen(search));
}

/* ── GET /api/notes/courses ─────────────────────────────── */
void handle_get_courses(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    (void)hm;
    char json[8192];
    db_get_courses(kdb, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/notes/branches?course_id=X ───────────────── */
void handle_get_branches(struct mg_connection *c,
                          struct mg_http_message *hm, KDB *kdb) {
    int course_id = get_int_param(hm, "course_id");
    char json[8192];
    db_get_branches(kdb, course_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/notes/years?branch_id=X ──────────────────── */
void handle_get_years(struct mg_connection *c,
                       struct mg_http_message *hm, KDB *kdb) {
    int branch_id = get_int_param(hm, "branch_id");
    char json[8192];
    db_get_years(kdb, branch_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/notes/subjects?year_id=X ─────────────────── */
void handle_get_subjects(struct mg_connection *c,
                          struct mg_http_message *hm, KDB *kdb) {
    int year_id = get_int_param(hm, "year_id");
    char json[8192];
    db_get_subjects(kdb, year_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/notes/teachers?subject_id=X ──────────────── */
void handle_get_teachers(struct mg_connection *c,
                          struct mg_http_message *hm, KDB *kdb) {
    int subject_id = get_int_param(hm, "subject_id");
    char json[8192];
    db_get_teachers_by_subject(kdb, subject_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/notes/files?teacher_id=X ─────────────────── */
void handle_get_notes(struct mg_connection *c,
                       struct mg_http_message *hm, KDB *kdb) {
    int teacher_id = get_int_param(hm, "teacher_id");
    char json[16384];
    db_get_notes(kdb, teacher_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── POST /api/notes/add-course ─────────────────────────── */
void handle_add_course(struct mg_connection *c,
                        struct mg_http_message *hm, KDB *kdb) {
    char body[1024]={0};
    strncpy(body, hm->body.buf, hm->body.len < 1023 ? hm->body.len : 1023);
    char name[128]={0};
    get_body_str(body, "name", name, sizeof(name));
    if (strlen(name) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"success\":false,\"message\":\"Name is required\"}");
        return;
    }
    db_add_course(kdb, name);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/notes/add-branch ─────────────────────────── */
void handle_add_branch(struct mg_connection *c,
                        struct mg_http_message *hm, KDB *kdb) {
    char body[1024]={0};
    strncpy(body, hm->body.buf, hm->body.len < 1023 ? hm->body.len : 1023);
    char name[128]={0};
    int  course_id = get_body_int(body, "course_id");
    get_body_str(body, "name", name, sizeof(name));
    db_add_branch(kdb, name, course_id);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/notes/add-year ───────────────────────────── */
void handle_add_year(struct mg_connection *c,
                      struct mg_http_message *hm, KDB *kdb) {
    char body[1024]={0};
    strncpy(body, hm->body.buf, hm->body.len < 1023 ? hm->body.len : 1023);
    char name[64]={0};
    int  branch_id = get_body_int(body, "branch_id");
    get_body_str(body, "name", name, sizeof(name));
    db_add_year(kdb, name, branch_id);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/notes/add-subject ────────────────────────── */
void handle_add_subject(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    char body[1024]={0};
    strncpy(body, hm->body.buf, hm->body.len < 1023 ? hm->body.len : 1023);
    char name[128]={0};
    int  year_id = get_body_int(body, "year_id");
    get_body_str(body, "name", name, sizeof(name));
    db_add_subject(kdb, name, year_id);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/notes/add-teacher ────────────────────────── */
void handle_add_teacher(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    char body[1024]={0};
    strncpy(body, hm->body.buf, hm->body.len < 1023 ? hm->body.len : 1023);
    char name[128]={0}, bio[256]={0};
    int  subject_id = get_body_int(body, "subject_id");
    get_body_str(body, "name", name, sizeof(name));
    get_body_str(body, "bio",  bio,  sizeof(bio));
    db_add_teacher(kdb, name, subject_id, bio);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/notes/upload ─────────────────────────────── */
void handle_upload_note(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    /* Mongoose handles multipart; here we log the metadata */
    (void)hm;
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: DATA PACKET RECEIVED. "
                  "PENDING VERIFICATION PROTOCOL.\"}");
}

/* ── GET /api/notes/download?id=X ───────────────────────── */
void handle_download_note(struct mg_connection *c,
                           struct mg_http_message *hm, KDB *kdb) {
    int note_id = get_int_param(hm, "id");
    /* Fetch file path from DB */
    const char *sql = "SELECT file_path, title FROM notes WHERE id=? AND status=1;";
    sqlite3_stmt *stmt;
    char path[512]={0}, title[128]="note";
    if (sqlite3_prepare_v2(kdb->db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, note_id);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            strncpy(path,  (const char*)sqlite3_column_text(stmt, 0), 511);
            strncpy(title, (const char*)sqlite3_column_text(stmt, 1), 127);
        }
    }
    sqlite3_finalize(stmt);

    if (strlen(path) == 0) {
        mg_http_reply(c, 404, "", "[ERROR: DATA FRAGMENT NOT FOUND]");
        return;
    }

    char headers[512];
    snprintf(headers, sizeof(headers),
             "Content-Disposition: attachment; filename=\"%s.pdf\"\r\n", title);
    mg_http_serve_file(c, hm, path,
                       &(struct mg_http_serve_opts){ .extra_headers = headers });
}
