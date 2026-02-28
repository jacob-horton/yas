ALTER TABLE email_verifications
ADD CONSTRAINT email_verifications_token_hash_unique UNIQUE (token_hash);

ALTER TABLE password_resets
ADD CONSTRAINT password_resets_token_hash_unique UNIQUE (token_hash);
