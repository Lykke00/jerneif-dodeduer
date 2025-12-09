CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "user_login_tokens";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "deposits";

CREATE TABLE "users"
(
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email"         VARCHAR(100) NOT NULL,
    "admin"         BOOLEAN DEFAULT FALSE NOT NULL,
    "active"        BOOLEAN DEFAULT TRUE NOT NULL ,
    "created_at"    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL 
);

CREATE TABLE user_login_tokens (
    "id"                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "token_hash"             TEXT NOT NULL,
    "expires_at"             TIMESTAMPTZ NOT NULL,
    "used_at"                TIMESTAMPTZ NULL,
    "created_at"             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "requested_ip"           TEXT NULL,
    "requested_user_agent"   TEXT NULL,
    "consumed_ip"            TEXT NULL,
    "consumed_user_agent"    TEXT NULL
);

CREATE TABLE deposits (
    "id"                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "amount"                 NUMERIC(12,2) NOT NULL,
    "payment_id"             VARCHAR(100),
    "payment_picture"        VARCHAR(150),
    "status"                 TEXT NOT NULL DEFAULT 'pending',
    "approved_by"            UUID REFERENCES users(id) ON DELETE CASCADE,
    "approved_at"            TIMESTAMPTZ,
    "created_at"             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT status_check CHECK ("status" IN ('pending', 'approved', 'declined'))            
);
