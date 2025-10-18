-- Ensure pgcrypto is enabled inside PaperTrail too
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- USERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- MAGIC LINK TOKENS
-- ==========================================================
CREATE TABLE IF NOT EXISTS magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user_email FOREIGN KEY (user_email)
        REFERENCES users(email)
        ON DELETE CASCADE
);

-- ==========================================================
-- INDEXES (safe to re-run)
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(user_email);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);