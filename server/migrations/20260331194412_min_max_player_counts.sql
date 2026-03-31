-- Add min/max player counts with temporary default values
ALTER TABLE games
    ADD COLUMN min_players_per_match INT NOT NULL DEFAULT 1,
    ADD COLUMN max_players_per_match INT NOT NULL DEFAULT 1;

-- Fill in the min/max from the previous players_per_match
UPDATE games
    SET min_players_per_match = players_per_match,
        max_players_per_match = players_per_match;

-- Ensure min <= max
ALTER TABLE games ADD CONSTRAINT check_player_logic CHECK (min_players_per_match <= max_players_per_match);

-- Delete old column
ALTER TABLE games DROP COLUMN players_per_match;

-- Remove temporary defaults
ALTER TABLE games ALTER COLUMN min_players_per_match DROP DEFAULT;
ALTER TABLE games ALTER COLUMN max_players_per_match DROP DEFAULT;
