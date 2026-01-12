CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id INT REFERENCES groups NOT NULL,

    created_by INT REFERENCES users NOT NULL,

    max_uses INTEGER DEFAULT 1,
    uses INTEGER DEFAULT 0 NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

ALTER TABLE group_members ADD role user_role NOT NULL DEFAULT 'member';

ALTER TABLE group_members ADD UNIQUE (user_id, group_id);
