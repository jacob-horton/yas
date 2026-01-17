ALTER TABLE users RENAME COLUMN username TO name;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

ALTER TABLE users ADD COLUMN email TEXT;

UPDATE users SET email = LOWER(REPLACE(name, ' ', '')) || '@email.com' WHERE email IS NULL;

-- Now that existing rows are populated, enforce NOT NULL and UNIQUE
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
