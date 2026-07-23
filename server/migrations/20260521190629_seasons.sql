CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    number INT NOT NULL,
    name TEXT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,

    CONSTRAINT unique_game_season_number UNIQUE (game_id, number)
);

-- Prevents having multiple "open-ended / active" seasons for the same game simultaneously
CREATE UNIQUE INDEX idx_one_active_season_per_game ON seasons(game_id) WHERE end_date IS NULL;

ALTER TABLE games
    ADD COLUMN season_duration INTERVAL DEFAULT NULL;

-- Start not null
ALTER TABLE matches
    ADD COLUMN season_id UUID REFERENCES seasons(id);

-- Make default season for each game
INSERT INTO seasons(game_id, number, start_date)
SELECT id AS game_id, 1 AS number, created_at AS start_date FROM games;

-- Fill in match seasons
UPDATE matches
    SET season_id = seasons.id
FROM seasons WHERE matches.game_id = seasons.game_id
  AND seasons.number = 1;

-- Make match season not null
ALTER TABLE matches ALTER COLUMN season_id SET NOT NULL;
