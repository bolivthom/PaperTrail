-- ==========================================================
-- RECEIPTS TABLE
-- notes: i know storing the image in the the row isnt the best but mvp :p
-- ==========================================================
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    purchase_date DATE NOT NULL,
    sub_total NUMERIC(12, 2) DEFAULT 0.00,
    gct NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'JMD',
    notes TEXT,
    image_data BYTEA,
    image_mime_type VARCHAR(50),
    image_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (for structure & scalability)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link it to receipts
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- ==========================================================
-- INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(purchase_date);
CREATE INDEX IF NOT EXISTS idx_receipts_company_name ON receipts(company_name);

-- Index on total_amount for analytic queries
CREATE INDEX IF NOT EXISTS idx_receipts_total_amount ON receipts(total_amount);