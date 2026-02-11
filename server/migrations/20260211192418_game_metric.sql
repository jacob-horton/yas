CREATE TYPE scoring_metric AS ENUM ('win_rate', 'average_score');

ALTER TABLE games ADD COLUMN metric scoring_metric NOT NULL DEFAULT 'win_rate';
