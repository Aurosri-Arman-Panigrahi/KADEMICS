#include "../include/auth.h"
#include <string.h>
#include <stdio.h>

void extract_roll_number(const char *email, char *roll_out) {
    if (!email) { roll_out[0]='\0'; return; }
    const char *at = strchr(email, '@');
    if (at) {
        size_t len = at - email;
        strncpy(roll_out, email, len);
        roll_out[len] = '\0';
    } else {
        strcpy(roll_out, email);
    }
}

bool auth_login(KDB *db, const char *email, const char *name, char *token_out, UserProfile *profile_out) {
    extract_roll_number(email, profile_out->roll_no);
    strncpy(profile_out->full_name, name, 99);
    strcpy(profile_out->rank_title, "VETERAN");
    sprintf(token_out, "demo_token_%s", profile_out->roll_no);
    return true;
}

bool auth_get_user(KDB *db, const char *token, UserProfile *profile_out) {
    strcpy(profile_out->roll_no, "2405001");
    strcpy(profile_out->full_name, "Admin Tester");
    strcpy(profile_out->rank_title, "COMMANDER");
    return true;
}

void auth_logout(KDB *db, const char *token) {
}
