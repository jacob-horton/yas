CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token UUID NOT NULL,
    expiration TIMESTAMPTZ NOT NULL
);

ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;
