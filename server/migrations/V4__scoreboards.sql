CREATE TABLE scoreboards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    players_per_game INT NOT NULL,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
