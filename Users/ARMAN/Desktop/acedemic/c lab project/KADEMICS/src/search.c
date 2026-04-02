#include "../include/search.h"
#include <windows.h>
#include <stdio.h>
#include <string.h>

// Global buffers to store mock search results from threads
static char archive_res[512] = "[]";
static char oracle_res[512]  = "[]";
static char gauntlet_res[512]= "[]";

DWORD WINAPI search_archive_thread(LPVOID lpParam) {
    // Simulated DB query for archive
    strcpy(archive_res, "[{\"section\":\"archive\",\"type\":\"note\",\"name\":\"Archive Result Dummy\"}]");
    return 0;
}

DWORD WINAPI search_oracle_thread(LPVOID lpParam) {
    strcpy(oracle_res, "[{\"section\":\"oracle\",\"id\":1,\"name\":\"Oracle Teacher Dummy\"}]");
    return 0;
}

DWORD WINAPI search_gauntlet_thread(LPVOID lpParam) {
    strcpy(gauntlet_res, "[{\"section\":\"gauntlet\",\"name\":\"Gauntlet Quiz Dummy\",\"status\":\"LIVE\"}]");
    return 0;
}

void handle_parallel_search(struct mg_connection *c, struct mg_http_message *hm, KDB *db) {
    // In a real implementation this would parse the query "q" from hm
    HANDLE threads[3];
    threads[0] = CreateThread(NULL, 0, search_archive_thread, NULL, 0, NULL);
    threads[1] = CreateThread(NULL, 0, search_oracle_thread, NULL, 0, NULL);
    threads[2] = CreateThread(NULL, 0, search_gauntlet_thread, NULL, 0, NULL);

    WaitForMultipleObjects(3, threads, TRUE, INFINITE);

    for(int i = 0; i < 3; i++) CloseHandle(threads[i]);

    mg_http_reply(c, 200, 
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Origin: *\r\n", 
        "{\"archive\":%s,\"oracle\":%s,\"gauntlet\":%s,\"nexus\":[]}", 
        archive_res, oracle_res, gauntlet_res);
}
