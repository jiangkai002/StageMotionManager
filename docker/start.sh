#!/bin/sh
set -eu

uvicorn app:app --host "${BACKEND_HOST}" --port "${BACKEND_PORT}" &
backend_pid="$!"

term_handler() {
  kill "$backend_pid" 2>/dev/null || true
  exit 0
}

trap term_handler INT TERM

nginx -g "daemon off;" &
nginx_pid="$!"

wait "$nginx_pid"
