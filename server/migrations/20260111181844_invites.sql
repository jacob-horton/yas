CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) NOT NULL,

    created_by UUID REFERENCES users(id) NOT NULL,

    max_uses INTEGER DEFAULT 1,
    uses INTEGER DEFAULT 0 NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
