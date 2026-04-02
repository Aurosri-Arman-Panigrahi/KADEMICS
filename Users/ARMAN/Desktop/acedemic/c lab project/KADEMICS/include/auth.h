#ifndef KADEMICS_AUTH_H
#define KADEMICS_AUTH_H
#include <stdbool.h>
#include "database.h"
#define TOKEN_LEN 64
typedef struct { char roll_no[20]; char full_name[100]; char rank_title[50]; } UserProfile;
void extract_roll_number(const char *email, char *roll_out);
bool auth_login(KDB *db, const char *email, const char *name, char *token_out, UserProfile *profile_out);
bool auth_get_user(KDB *db, const char *token, UserProfile *profile_out);
void auth_logout(KDB *db, const char *token);
#endif
