#!/bin/sh
set -eu

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
  echo "Creating databases: ${POSTGRES_MULTIPLE_DATABASES}"
  echo "${POSTGRES_MULTIPLE_DATABASES}" | tr ',' ' ' | while read -r dbs; do
    for db in $dbs; do
      psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $db;
        GRANT ALL PRIVILEGES ON DATABASE $db TO "$POSTGRES_USER";
EOSQL
    done
  done
fi
