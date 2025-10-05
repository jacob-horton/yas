CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    win_percent INT,
    points_per_game FLOAT
);
