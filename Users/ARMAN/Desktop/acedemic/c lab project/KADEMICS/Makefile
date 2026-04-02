# ============================================================
# KADEMICS — Makefile
# Build automation for the C backend server
# Usage:
#   make          → Build kademics.exe
#   make clean    → Remove compiled binary
#   make run      → Build and run the server
# ============================================================

CC      = gcc
TARGET  = bin/kademics.exe

# ── Include directories ──────────────────────────────────
CFLAGS  = -Iinclude -Ilib -Wall -Wextra -O2

# ── Windows libraries ────────────────────────────────────
# ws2_32 = WinSock (for Mongoose networking)
LIBS    = -lws2_32

# ── All C source files ───────────────────────────────────
SRCS    = src/main.c      \
          src/auth.c      \
          src/database.c  \
          src/notes.c     \
          src/oracle.c    \
          src/gauntlet.c  \
          src/nexus.c     \
          src/search.c    \
          lib/mongoose.c  \
          lib/sqlite3.c

# ── Default target: build ────────────────────────────────
all: $(TARGET)

$(TARGET): $(SRCS)
	@echo [COMPILING] Building KADEMICS...
	@if not exist bin mkdir bin
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET) $(LIBS)
	@echo [SUCCESS] Binary: $(TARGET)
	@echo [READY]   Run with: make run

# ── Run the server ───────────────────────────────────────
run: all
	@echo [LAUNCHING] Starting KADEMICS server...
	@if not exist data mkdir data
	@if not exist data\uploads mkdir data\uploads
	$(TARGET)

# ── Clean build artifacts ────────────────────────────────
clean:
	@echo [CLEAN] Removing built files...
	@if exist bin\kademics.exe del bin\kademics.exe
	@echo [DONE]

.PHONY: all run clean
