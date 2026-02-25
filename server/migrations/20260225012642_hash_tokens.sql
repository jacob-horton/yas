-- Hash password reset and email verification tokens in DB to mitigate DB leak damage
ALTER TABLE email_verifications
ALTER COLUMN token TYPE VARCHAR(64); -- SHA256 is 32 bytes - double to be safe

ALTER TABLE email_verifications
RENAME COLUMN token TO token_hash;

ALTER TABLE password_resets
ALTER COLUMN token TYPE VARCHAR(64); -- SHA256 is 32 bytes - double to be safe

ALTER TABLE password_resets
RENAME COLUMN token TO token_hash;
