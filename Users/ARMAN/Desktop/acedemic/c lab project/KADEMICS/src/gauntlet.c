/*
 * ============================================================
 * KADEMICS — gauntlet.c
 * The Gauntlet: Quiz State Machine, Proctoring & CSV Export
 * Pure C FILE* is used for CSV generation (no external lib).
 * ============================================================
 */

#include "../include/gauntlet.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ── CSV Export (pure C FILE* I/O) ─────────────────────── */
int export_quiz_csv(KDB *kdb, int quiz_id, const char *filepath) {
    FILE *f = fopen(filepath, "w");
    if (!f) return 0;

    /* Write header row */
    fprintf(f, "Name,Roll Number,Score,Correct Answers,Incorrect Answers,"
               "Tab Switches,Submission Time\n");

    /* Fetch quiz results from database */
    const char *sql =
        "SELECT s.user_name, s.user_roll, s.score, s.switches, s.submitted_at,"
        " (SELECT COUNT(*) FROM questions WHERE quiz_id=?) as total_q"
        " FROM submissions s WHERE s.quiz_id=? ORDER BY s.score DESC;";
    sqlite3_stmt *stmt;
    int ok = 0;
    if (sqlite3_prepare_v2(kdb->db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, quiz_id);
        sqlite3_bind_int(stmt, 2, quiz_id);
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            const char *name  = (const char*)sqlite3_column_text(stmt, 0);
            const char *roll  = (const char*)sqlite3_column_text(stmt, 1);
            int   score       = sqlite3_column_int(stmt, 2);
            int   switches    = sqlite3_column_int(stmt, 3);
            const char *ts    = (const char*)sqlite3_column_text(stmt, 4);
            int   total_q     = sqlite3_column_int(stmt, 5);
            int   correct     = score; /* simplified: 1 mark per question */
            int   incorrect   = total_q - correct;
            fprintf(f, "\"%s\",\"%s\",%d,%d,%d,%d,\"%s\"\n",
                    name, roll, score, correct, incorrect, switches, ts);
        }
        ok = 1;
    }
    sqlite3_finalize(stmt);
    fclose(f);
    db_log("CSV_EXPORT", filepath);
    return ok;
}

/* ── Score Calculation ──────────────────────────────────── */
int calculate_score(KDB *kdb, int quiz_id, const char *answers_json) {
    /* answers_json format: "A,B,C,A,D,..." (comma-separated) */
    /* Fetch correct answers from DB */
    const char *sql = "SELECT correct, marks FROM questions WHERE quiz_id=? ORDER BY id;";
    sqlite3_stmt *stmt;
    int total_score = 0;

    /* Parse student answers */
    char ans_copy[4096];
    strncpy(ans_copy, answers_json, sizeof(ans_copy) - 1);

    int q_index = 0;
    char *token = strtok(ans_copy, ",");

    if (sqlite3_prepare_v2(kdb->db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_int(stmt, 1, quiz_id);
        while (sqlite3_step(stmt) == SQLITE_ROW && token != NULL) {
            const char *correct = (const char*)sqlite3_column_text(stmt, 0);
            int marks           = sqlite3_column_int(stmt, 1);
            /* Compare student answer to correct answer */
            if (correct && strcmp(token, correct) == 0) {
                total_score += marks;
            }
            token = strtok(NULL, ",");
            q_index++;
        }
    }
    sqlite3_finalize(stmt);
    return total_score;
}

double calculate_quiz_avg(KDB *kdb, int quiz_id) {
    return db_calc_quiz_avg(kdb, quiz_id);
}

/* ── HTTP: Get All Quizzes ──────────────────────────────── */
void handle_get_quizzes(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    (void)hm;
    char json[32768];
    db_get_quizzes(kdb, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── HTTP: Verify Quiz ID + Password ────────────────────── */
void handle_verify_quiz(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    /* Parse quiz_id and password from request body */
    char body[1024] = {0};
    size_t blen = hm->body.len < 1023 ? hm->body.len : 1023;
    strncpy(body, hm->body.buf, blen);

    int quiz_id = 0;
    char password[128] = {0};

    /* Extract quiz_id */
    char *p = strstr(body, "\"quiz_id\":");
    if (p) sscanf(p + 10, "%d", &quiz_id);

    /* Extract password */
    char *pp = strstr(body, "\"password\":\"");
    if (pp) { pp += 12; int ii=0; while(*pp && *pp!='"' && ii<127) password[ii++]=*pp++; password[ii]='\0'; }

    int result = db_verify_quiz(kdb, quiz_id, password);

    char response[512];
    switch (result) {
        case ERR_AUTH_OK:
            /* Return quiz questions */
            snprintf(response, sizeof(response),
                     "{\"success\":true,\"quiz_id\":%d}", quiz_id);
            break;
        case ERR_WRONG_ID:
            snprintf(response, sizeof(response),
                     "{\"success\":false,\"error\":\"WRONG_ID\","
                     "\"message\":\"[ERROR: ID NOT RECOGNIZED. PLEASE TRY AGAIN]\"}");
            break;
        case ERR_WRONG_PASS:
            snprintf(response, sizeof(response),
                     "{\"success\":false,\"error\":\"WRONG_PASS\","
                     "\"message\":\"[ERROR: AUTHENTICATION KEY INVALID. PLEASE TRY AGAIN]\"}");
            break;
        default:
            snprintf(response, sizeof(response),
                     "{\"success\":false,\"error\":\"BOTH_WRONG\","
                     "\"message\":\"[ERROR: QUIZ ID AND PASSWORD BOTH INCORRECT. PLEASE TRY AGAIN]\"}");
    }
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", response);
}

/* ── HTTP: Get Questions ────────────────────────────────── */
void handle_get_questions(struct mg_connection *c,
                           struct mg_http_message *hm, KDB *kdb) {
    struct mg_str qid = mg_http_var(hm->query, mg_str("quiz_id"));
    if (qid.len == 0) { mg_http_reply(c, 400, "", "Missing quiz_id"); return; }
    int quiz_id = atoi(qid.buf);
    char json[32768];
    db_get_quiz_questions(kdb, quiz_id, json, sizeof(json));
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", json);
}

/* ── HTTP: Submit Quiz ──────────────────────────────────── */
void handle_submit_quiz(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    char body[4096] = {0};
    size_t blen = hm->body.len < 4095 ? hm->body.len : 4095;
    strncpy(body, hm->body.buf, blen);

    int  quiz_id = 0; char roll[20] = {0}; char answers[2048] = {0};
    char *p;
    p = strstr(body, "\"quiz_id\":"); if (p) sscanf(p+10, "%d", &quiz_id);
    p = strstr(body, "\"roll\":\"");  if (p) { p+=8; int i=0; while(*p&&*p!='"'&&i<19) roll[i++]=*p++; roll[i]='\0'; }
    p = strstr(body, "\"answers\":\""); if (p) { p+=11; int i=0; while(*p&&*p!='"'&&i<2047) answers[i++]=*p++; answers[i]='\0'; }

    int score = calculate_score(kdb, quiz_id, answers);
    db_submit_quiz(kdb, quiz_id, roll, answers, score);
    double avg = db_calc_quiz_avg(kdb, quiz_id);

    char response[256];
    snprintf(response, sizeof(response),
             "{\"success\":true,\"score\":%d,\"class_avg\":%.1f}", score, avg);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", response);
}

/* ── HTTP: Log Tab Switch (Anti-Cheat) ──────────────────── */
void handle_log_switch(struct mg_connection *c,
                        struct mg_http_message *hm, KDB *kdb) {
    char body[512] = {0};
    size_t blen = hm->body.len < 511 ? hm->body.len : 511;
    strncpy(body, hm->body.buf, blen);

    int quiz_id = 0; char roll[20] = {0};
    char *p;
    p = strstr(body, "\"quiz_id\":"); if (p) sscanf(p+10, "%d", &quiz_id);
    p = strstr(body, "\"roll\":\"");  if (p) { p+=8; int i=0; while(*p&&*p!='"'&&i<19) roll[i++]=*p++; roll[i]='\0'; }

    db_log_switch(kdb, quiz_id, roll);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"logged\":true}");
}

/* ── HTTP: Get My Result ────────────────────────────────── */
void handle_get_my_result(struct mg_connection *c,
                            struct mg_http_message *hm, KDB *kdb) {
    char quiz_id_s[16]={0}, roll[20]={0};
    struct mg_str qid  = mg_http_var(hm->query, mg_str("quiz_id"));
    struct mg_str qroll = mg_http_var(hm->query, mg_str("roll"));
    if (qid.len)  { strncpy(quiz_id_s, qid.buf,  qid.len  < 15 ? qid.len  : 15); }
    if (qroll.len){ strncpy(roll,       qroll.buf, qroll.len < 19 ? qroll.len : 19); }
    int quiz_id = atoi(quiz_id_s);

    char json[8192];
    db_get_quiz_results(kdb, quiz_id, json, sizeof(json));
    double avg = db_calc_quiz_avg(kdb, quiz_id);
    char response[8192+64];
    snprintf(response, sizeof(response), "{\"results\":%s,\"class_avg\":%.1f}", json, avg);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", response);
}

/* ── HTTP: Host Results ─────────────────────────────────── */
void handle_host_results(struct mg_connection *c,
                           struct mg_http_message *hm, KDB *kdb) {
    handle_get_my_result(c, hm, kdb); /* Same endpoint, same data */
}

/* ── HTTP: Export CSV ───────────────────────────────────── */
void handle_export_csv(struct mg_connection *c,
                        struct mg_http_message *hm, KDB *kdb) {
    struct mg_str qid = mg_http_var(hm->query, mg_str("quiz_id"));
    if (qid.len == 0) { mg_http_reply(c, 400, "", "Missing quiz_id"); return; }
    int quiz_id = atoi(qid.buf);

    /* Generate CSV file in data/uploads/ */
    char filepath[256];
    snprintf(filepath, sizeof(filepath), "data/uploads/quiz_%d_results.csv", quiz_id);
    export_quiz_csv(kdb, quiz_id, filepath);

    /* Stream file back to browser */
    mg_http_serve_file(c, hm, filepath,
                       &(struct mg_http_serve_opts){
                           .extra_headers =
                               "Content-Disposition: attachment; filename=quiz_results.csv\r\n"
                       });
}

/* ── HTTP: Create Quiz ──────────────────────────────────── */
void handle_create_quiz(struct mg_connection *c,
                         struct mg_http_message *hm, KDB *kdb) {
    char body[2048] = {0};
    size_t blen = hm->body.len < 2047 ? hm->body.len : 2047;
    strncpy(body, hm->body.buf, blen);

    char title[128]={0}, subject[128]={0}, host_roll[20]={0};
    char type[16]={0}, password[64]={0}, start[32]={0}, end[32]={0};
    char *p;
    p = strstr(body, "\"title\":\"");     if(p){p+=9; int i=0; while(*p&&*p!='"'&&i<127) title[i++]=*p++;      title[i]='\0';}
    p = strstr(body, "\"subject\":\"");   if(p){p+=10; int i=0; while(*p&&*p!='"'&&i<127) subject[i++]=*p++;   subject[i]='\0';}
    p = strstr(body, "\"host_roll\":\""); if(p){p+=12; int i=0; while(*p&&*p!='"'&&i<19)  host_roll[i++]=*p++; host_roll[i]='\0';}
    p = strstr(body, "\"type\":\"");      if(p){p+=8;  int i=0; while(*p&&*p!='"'&&i<15)  type[i++]=*p++;      type[i]='\0';}
    p = strstr(body, "\"password\":\"");  if(p){p+=12; int i=0; while(*p&&*p!='"'&&i<63)  password[i++]=*p++;  password[i]='\0';}
    p = strstr(body, "\"start\":\"");     if(p){p+=9;  int i=0; while(*p&&*p!='"'&&i<31)  start[i++]=*p++;     start[i]='\0';}
    p = strstr(body, "\"end\":\"");       if(p){p+=7;  int i=0; while(*p&&*p!='"'&&i<31)  end[i++]=*p++;       end[i]='\0';}

    int quiz_id = db_create_quiz(kdb, title, subject, host_roll, type, password, start, end);
    char response[128];
    snprintf(response, sizeof(response),
             "{\"success\":%s,\"quiz_id\":%d}",
             quiz_id ? "true" : "false", quiz_id);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "%s", response);
}

/* ── HTTP: Add Question ─────────────────────────────────── */
void handle_add_question(struct mg_connection *c,
                          struct mg_http_message *hm, KDB *kdb) {
    char body[4096] = {0};
    size_t blen = hm->body.len < 4095 ? hm->body.len : 4095;
    strncpy(body, hm->body.buf, blen);

    int quiz_id=0;
    char content[512]={0}, oa[256]={0}, ob[256]={0}, oc[256]={0}, od[256]={0};
    char correct[8]={0}, choice_type[16]="SINGLE";
    int marks=1;
    char *p;
    p = strstr(body, "\"quiz_id\":"); if(p) sscanf(p+10, "%d", &quiz_id);
    p = strstr(body, "\"q\":\"");     if(p){p+=5; int i=0; while(*p&&*p!='"'&&i<511) content[i++]=*p++;  content[i]='\0';}
    p = strstr(body, "\"a\":\"");     if(p){p+=5; int i=0; while(*p&&*p!='"'&&i<255) oa[i++]=*p++;       oa[i]='\0';}
    p = strstr(body, "\"b\":\"");     if(p){p+=5; int i=0; while(*p&&*p!='"'&&i<255) ob[i++]=*p++;       ob[i]='\0';}
    p = strstr(body, "\"c\":\"");     if(p){p+=5; int i=0; while(*p&&*p!='"'&&i<255) oc[i++]=*p++;       oc[i]='\0';}
    p = strstr(body, "\"d\":\"");     if(p){p+=5; int i=0; while(*p&&*p!='"'&&i<255) od[i++]=*p++;       od[i]='\0';}
    p = strstr(body, "\"correct\":\"");if(p){p+=11;int i=0; while(*p&&*p!='"'&&i<7)  correct[i++]=*p++;  correct[i]='\0';}
    p = strstr(body, "\"marks\":");   if(p) sscanf(p+8, "%d", &marks);

    int ok = db_add_question(kdb, quiz_id, content, oa, ob, oc, od, correct, marks, choice_type);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":%s}", ok ? "true" : "false");
}

/* ── HTTP: Update Quiz Status ───────────────────────────── */
void handle_update_quiz_status(struct mg_connection *c,
                                struct mg_http_message *hm, KDB *kdb) {
    char body[512] = {0};
    size_t blen = hm->body.len < 511 ? hm->body.len : 511;
    strncpy(body, hm->body.buf, blen);

    int quiz_id=0; char status[16]={0};
    char *p;
    p = strstr(body, "\"quiz_id\":"); if(p) sscanf(p+10, "%d", &quiz_id);
    p = strstr(body, "\"status\":\""); if(p){p+=10; int i=0; while(*p&&*p!='"'&&i<15) status[i++]=*p++; status[i]='\0';}

    const char *sql = "UPDATE quizzes SET status=? WHERE id=?;";
    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(kdb->db, sql, -1, &stmt, NULL) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, status, -1, SQLITE_STATIC);
        sqlite3_bind_int (stmt, 2, quiz_id);
        sqlite3_step(stmt);
    }
    sqlite3_finalize(stmt);
    char log_msg[128];
    snprintf(log_msg, sizeof(log_msg), "Quiz %d → %s", quiz_id, status);
    db_log("QUIZ_STATUS", log_msg);
    mg_http_reply(c, 200,
                  "Content-Type: application/json\r\n"
                  "Access-Control-Allow-Origin: *\r\n",
                  "{\"success\":true,\"status\":\"%s\"}", status);
}
