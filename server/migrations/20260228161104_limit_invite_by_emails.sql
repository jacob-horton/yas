ALTER TABLE invites ADD COLUMN email_whitelist TEXT[] NOT NULL DEFAULT '{}';
