/*
 * ============================================================
 * KADEMICS — oracle.c
 * The Oracle: Teacher Rating & Dossier System
 * Implements calculate_mean_rating() using SQL AVG().
 * ============================================================
 */

#include "../include/oracle.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/* Utility: extract body field */
static void body_str(const char *body, const char *key, char *out, int maxlen) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":\"", key);
    char *p = strstr(body, search);
    if (!p) { out[0]='\0'; return; }
    p += strlen(search);
    int i = 0;
    while (*p && *p != '"' && i < maxlen-1) out[i++] = *p++;
    out[i] = '\0';
}

static int body_int(const char *body, const char *key) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":", key);
    char *p = strstr(body, search);
    if (!p) return 0;
    return atoi(p + strlen(search));
}

static float body_float(const char *body, const char *key) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":", key);
    char *p = strstr(body, search);
    if (!p) return 0.0f;
    return (float)atof(p + strlen(search));
}

/* ── Business Logic: Calculate Mean Rating ──────────────── */
/*
 * Uses SQL AVG() for mathematical accuracy.
 * Formula: mean = SUM(score) / COUNT(score)
 */
double calculate_mean_rating(KDB *kdb, int teacher_id) {
    return db_calc_avg_rating(kdb, teacher_id);
}

/* ── GET /api/oracle/teachers ───────────────────────────── */
void handle_oracle_teachers(struct mg_connection *c,
                              struct mg_http_message *hm, KDB *kdb) {
    (void)hm;
    char json[32768];
    db_get_oracle_teachers(kdb, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/oracle/teacher?id=X (Full Dossier) ────────── */
void handle_oracle_dossier(struct mg_connection *c,
                             struct mg_http_message *hm, KDB *kdb) {
    struct mg_str qid = mg_http_var(hm->query, mg_str("id"));
    if (qid.len == 0) { mg_http_reply(c, 400, "", "Missing id"); return; }
    int teacher_id = atoi(qid.buf);

    /* Fetch base teacher info */
    const char *sql = "SELECT id,name,photo,bio,qualification FROM oracle_teachers WHERE id=?;";
    sqlite3_stmt *stmt;
    char dossier[4096] = {0};

    if (sqlite3_prepare_v2(kdb->db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, teacher_id);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            double avg = calculate_mean_rating(kdb, teacher_id);
            snprintf(dossier, sizeof(dossier),
                     "{\"id\":%d,\"name\":\"%s\",\"photo\":\"%s\","
                     "\"bio\":\"%s\",\"qualification\":\"%s\",\"avg_rating\":%.1f",
                     sqlite3_column_int (stmt, 0),
                     sqlite3_column_text(stmt, 1),
                     sqlite3_column_text(stmt, 2),
                     sqlite3_column_text(stmt, 3),
                     sqlite3_column_text(stmt, 4), avg);
        }
    }
    sqlite3_finalize(stmt);

    if (strlen(dossier) == 0) {
        mg_http_reply(c, 404, "Content-Type: application/json\r\n",
                      "{\"error\":\"[ERROR: DATA FRAGMENT NOT FOUND]\"}");
        return;
    }

    /* Append sections */
    char sections[16384];
    db_get_sections(kdb, teacher_id, sections, sizeof(sections));
    char response[32768];
    snprintf(response, sizeof(response), "%s,\"sections\":%s}", dossier, sections);

    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", response);
}

/* ── GET /api/oracle/sections?teacher_id=X ─────────────── */
void handle_oracle_sections(struct mg_connection *c,
                              struct mg_http_message *hm, KDB *kdb) {
    struct mg_str qtid = mg_http_var(hm->query, mg_str("teacher_id"));
    if (qtid.len == 0) { mg_http_reply(c, 400, "", "Missing teacher_id"); return; }
    int tid = atoi(qtid.buf);
    char json[16384];
    db_get_sections(kdb, tid, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── GET /api/oracle/comments?section_id=X ─────────────── */
void handle_oracle_comments(struct mg_connection *c,
                              struct mg_http_message *hm, KDB *kdb) {
    struct mg_str qsid = mg_http_var(hm->query, mg_str("section_id"));
    if (qsid.len == 0) { mg_http_reply(c, 400, "", "Missing section_id"); return; }
    int sid = atoi(qsid.buf);
    char json[16384];
    db_get_section_comments(kdb, sid, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── POST /api/oracle/add-teacher ───────────────────────── */
void handle_oracle_add_teacher(struct mg_connection *c,
                                struct mg_http_message *hm, KDB *kdb) {
    char body[2048]={0};
    strncpy(body, hm->body.buf, hm->body.len < 2047 ? hm->body.len : 2047);
    char name[128]={0}, photo[256]={0}, bio[512]={0}, qual[512]={0};
    body_str(body, "name",          name,  sizeof(name));
    body_str(body, "photo",         photo, sizeof(photo));
    body_str(body, "bio",           bio,   sizeof(bio));
    body_str(body, "qualification", qual,  sizeof(qual));
    db_add_oracle_teacher(kdb, name, photo, bio, qual);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: MENTOR DOSSIER UPLINKED.\"}");
}

/* ── POST /api/oracle/add-section ───────────────────────── */
void handle_oracle_add_section(struct mg_connection *c,
                                struct mg_http_message *hm, KDB *kdb) {
    char body[2048]={0};
    strncpy(body, hm->body.buf, hm->body.len < 2047 ? hm->body.len : 2047);
    int  tid = body_int(body, "teacher_id");
    char section[32]={0}, subject[128]={0}, desc[512]={0}, roll[20]={0};
    body_str(body, "section_name", section, sizeof(section));
    body_str(body, "subject",      subject, sizeof(subject));
    body_str(body, "description",  desc,    sizeof(desc));
    body_str(body, "roll",         roll,    sizeof(roll));
    db_add_section(kdb, tid, section, subject, desc, roll);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"message\":\"[SYSTEM]: UPLINK RECEIVED. "
                  "AWAITING ADMIN DECRYPTION...\"}");
}

/* ── POST /api/oracle/comment ───────────────────────────── */
void handle_oracle_comment(struct mg_connection *c,
                             struct mg_http_message *hm, KDB *kdb) {
    char body[2048]={0};
    strncpy(body, hm->body.buf, hm->body.len < 2047 ? hm->body.len : 2047);
    int  sid = body_int(body, "section_id");
    char roll[20]={0}, msg[1024]={0};
    body_str(body, "roll",    roll, sizeof(roll));
    body_str(body, "message", msg,  sizeof(msg));
    db_add_comment(kdb, sid, roll, msg);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true}");
}

/* ── POST /api/oracle/rate ──────────────────────────────── */
void handle_oracle_rate(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    char body[512]={0};
    strncpy(body, hm->body.buf, hm->body.len < 511 ? hm->body.len : 511);
    int   tid  = body_int  (body, "teacher_id");
    int   sid  = body_int  (body, "section_id");
    float score= body_float(body, "score");
    char  roll[20]={0};
    body_str(body, "roll", roll, sizeof(roll));

    if (score < 0.5f) score = 0.5f;
    if (score > 5.0f) score = 5.0f;

    db_add_rating(kdb, tid, roll, score, sid);

    /* Return updated average */
    double new_avg = calculate_mean_rating(kdb, tid);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"new_avg\":%.1f}", new_avg);
}
