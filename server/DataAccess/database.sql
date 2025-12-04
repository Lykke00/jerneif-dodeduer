CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "user_login_tokens";
DROP TABLE IF EXISTS "users";

CREATE TABLE "users"
(
    "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email"       VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_login_tokens (
    "id" UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "token_hash"             TEXT NOT NULL,
    "expires_at"             TIMESTAMPTZ NOT NULL,
    "used_at"                TIMESTAMPTZ NULL,
    "created_at"             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "requested_ip"           TEXT NULL,
    "requested_user_agent"   TEXT NULL,
    "consumed_ip"            TEXT NULL,
    "consumed_user_agent"    TEXT NULL
);
