CREATE INDEX idx_match_scores_ranking ON match_scores (match_id, score DESC);

CREATE VIEW match_leaderboards AS
SELECT
    *,
    RANK() OVER (PARTITION BY match_id ORDER BY score DESC) as rank
FROM match_scores;
