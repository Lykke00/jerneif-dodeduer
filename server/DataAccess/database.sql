CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS game_plays_numbers;
DROP TABLE IF EXISTS game_winning_numbers;
DROP TABLE IF EXISTS game_board_numbers;
DROP TABLE IF EXISTS users_balance;
DROP TABLE IF EXISTS user_login_tokens;

DROP TABLE IF EXISTS board_repeat_plans;
DROP TABLE IF EXISTS game_plays;
DROP TABLE IF EXISTS deposits;

DROP TABLE IF EXISTS game_boards;
DROP TABLE IF EXISTS games;

DROP TABLE IF EXISTS users;

CREATE TABLE "users"
(
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email"         VARCHAR(100) NOT NULL,
    "first_name"    VARCHAR(50) NOT NULL,
    "last_name"     VARCHAR(50) NOT NULL,
    "phone"         VARCHAR(20) NOT NULL,
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

CREATE TABLE "games"
(
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "week"          INT NOT NULL,
    "year"          INT NOT NULL,
    "created_at"    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE game_winning_numbers
(
    "game_id"    UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    "number"     INT NOT NULL,

    PRIMARY KEY (game_id, number),
    CONSTRAINT number_range_check CHECK (number BETWEEN 1 AND 16)
);


CREATE TABLE "game_plays"
(
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "game_id"       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    "user_id"       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "created_at"    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE users_balance
(
    "id"         UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    "user_id"    UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    "amount"     NUMERIC(12, 2) NOT NULL,
    "type"       TEXT           NOT NULL DEFAULT 'deposit',
    "deposit_id" UUID           REFERENCES deposits (id) ON DELETE CASCADE,
    "play_id"    UUID           REFERENCES game_plays (id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT type_check CHECK ("type" IN ('deposit', 'play'))
);

CREATE TABLE "game_plays_numbers"
(
    "play_id"      UUID NOT NULL REFERENCES game_plays(id) ON DELETE CASCADE,
    "number"       INT NOT NULL,
        
    PRIMARY KEY (play_id, number),
    CONSTRAINT number_range_check CHECK (number BETWEEN 1 AND 16)
);

CREATE TABLE game_boards (
     "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     "user_id"    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE game_board_numbers (
    "board_id" UUID NOT NULL REFERENCES game_boards(id) ON DELETE CASCADE,
    "number"   INT NOT NULL,
    
    PRIMARY KEY (board_id, number),
    CONSTRAINT number_range_check CHECK (number BETWEEN 1 AND 16)
);

CREATE TABLE board_repeat_plans (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "board_id"        UUID NOT NULL REFERENCES game_boards(id) ON DELETE CASCADE,
    
    "repeat_count"    INT NOT NULL, -- fx 10 uger
    "played_count"    INT NOT NULL DEFAULT 0,
    
    "active"          BOOLEAN NOT NULL DEFAULT TRUE,
    "stopped_at"      TIMESTAMPTZ NULL,
    
    "created_at"      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT repeat_count_positive CHECK (repeat_count > 0)
);

CREATE TABLE board_played_games (
    "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "board_id"         UUID NOT NULL REFERENCES game_boards(id),
    "game_id"          UUID NOT NULL REFERENCES games(id),
    "repeat_plan_id"   UUID NULL REFERENCES board_repeat_plans(id),
    
    "played_at"        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (board_id, game_id)
);


CREATE UNIQUE INDEX idx_users_email
    ON users (email);

CREATE INDEX idx_users_active
    ON users (active);

CREATE INDEX idx_user_login_tokens_user_id
    ON user_login_tokens (user_id);

CREATE UNIQUE INDEX idx_user_login_tokens_token_hash
    ON user_login_tokens (token_hash);

CREATE INDEX idx_user_login_tokens_expires_at
    ON user_login_tokens (expires_at);

CREATE INDEX idx_deposits_user_id
    ON deposits (user_id);

CREATE INDEX idx_deposits_status
    ON deposits (status);

CREATE INDEX idx_deposits_approved_by
    ON deposits (approved_by);

CREATE INDEX idx_deposits_status_created_at
    ON deposits (status, created_at);

CREATE INDEX idx_users_balance_user_id
    ON users_balance (user_id);

CREATE UNIQUE INDEX idx_users_balance_deposit_id
    ON users_balance (deposit_id)
    WHERE deposit_id IS NOT NULL;

CREATE INDEX idx_users_balance_user_created_at
    ON users_balance (user_id, created_at DESC);

CREATE UNIQUE INDEX idx_games_week_year
    ON games (week, year);

CREATE INDEX idx_game_plays_game_user
    ON game_plays (game_id, user_id);