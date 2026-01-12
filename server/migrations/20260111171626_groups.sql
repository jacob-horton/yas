CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE IF NOT EXISTS group_members (
    user_id UUID REFERENCES users(id) NOT NULL,
    group_id UUID REFERENCES groups(id) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    role user_role NOT NULL DEFAULT 'member',

    PRIMARY KEY (user_id, group_id)
);
