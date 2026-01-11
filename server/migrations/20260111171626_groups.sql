CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_by INT REFERENCES users NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    user_id INT REFERENCES users NOT NULL,
    group_id INT REFERENCES groups NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);
