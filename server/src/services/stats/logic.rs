use crate::errors::StatsError;
use crate::models::game::GameDb;
use crate::models::stats::{MedalsThresholds, PlayerStats};
use crate::models::{
    game::OrderBy,
    stats::{Distribution, DistributionWithMaxMin, RawMatchStats, ScoreboardEntry},
};
use std::cmp::Ordering;
use std::collections::HashMap;
use uuid::Uuid;

pub const MIN_MATCHES_FOR_DISTRIBUTION: usize = 5;

pub fn get_comparator(order: OrderBy, a: &ScoreboardEntry, b: &ScoreboardEntry) -> Ordering {
    match order {
        OrderBy::WinRate => a
            .win_rate
            .total_cmp(&b.win_rate)
            .then_with(|| a.average_score.total_cmp(&b.average_score))
            .then_with(|| a.matches_played.cmp(&b.matches_played)),

        OrderBy::AverageScore => a
            .average_score
            .total_cmp(&b.average_score)
            .then_with(|| a.win_rate.total_cmp(&b.win_rate))
            .then_with(|| a.matches_played.cmp(&b.matches_played)),

        OrderBy::Name => a
            .user_name
            .cmp(&b.user_name)
            .then_with(|| a.win_rate.total_cmp(&b.win_rate))
            .then_with(|| a.average_score.total_cmp(&b.average_score))
            .then_with(|| a.matches_played.cmp(&b.matches_played)),
    }
    .then_with(|| a.user_name.cmp(&b.user_name))
    .reverse() // Default to descending
}

pub fn calculate_stats(matches: &[RawMatchStats], thresholds: &MedalsThresholds) -> PlayerStats {
    let mut stats = PlayerStats::default();
    let mut sum_score = 0;
    let count = matches.len() as i64;

    if count == 0 {
        return stats;
    }

    for m in matches {
        sum_score += m.score;
        stats.best_score = stats.best_score.max(m.score);

        if m.rank_in_match == 1 {
            stats.wins += 1;
        }

        stats.medals.count_medal(m.score, thresholds);
    }

    stats.matches_played = count;
    stats.average_score = sum_score as f64 / count as f64;
    stats.win_rate = stats.wins as f64 / count as f64;

    stats
}

pub fn get_player_distribution(
    all_matches: &[RawMatchStats],
    player_id: Uuid,
) -> Result<DistributionWithMaxMin, StatsError> {
    let player_data: Vec<_> = all_matches
        .iter()
        .filter(|m| m.user_id == player_id)
        .collect();

    if player_data.len() < MIN_MATCHES_FOR_DISTRIBUTION {
        return Err(StatsError::NotEnoughData);
    }

    let scores: Vec<_> = player_data.iter().map(|d| d.score).collect();
    let mean = scores.iter().sum::<i32>() as f64 / scores.len() as f64;
    let variance = scores
        .iter()
        .map(|&x| (x as f64 - mean).powi(2))
        .sum::<f64>()
        / (scores.len() as f64 - 1.0);

    let dist = Distribution::Gamma {
        lambda: mean / variance,
        alpha: mean.powi(2) / variance,
    };

    let min = scores
        .iter()
        .min()
        .expect("Min not found despite having data");
    let max = scores
        .iter()
        .max()
        .expect("Max not found despite having data");

    Ok(DistributionWithMaxMin {
        min_score: *min,
        max_score: *max,
        distribution: dist,
    })
}

pub fn build_scoreboard_entries(
    raw_data: Vec<RawMatchStats>,
    game: &GameDb,
) -> Vec<ScoreboardEntry> {
    if raw_data.is_empty() {
        return Vec::new();
    }

    let most_recent_match = raw_data.first().expect("No most recent game").match_id;

    // Group by user
    let mut user_groups: HashMap<Uuid, Vec<RawMatchStats>> = HashMap::new();
    for row in raw_data {
        user_groups.entry(row.user_id).or_default().push(row);
    }

    let mut entries = Vec::new();
    let mut prev_entries = Vec::new();

    let thresholds = MedalsThresholds {
        star: game.star_threshold,
        gold: game.gold_threshold,
        silver: game.silver_threshold,
        bronze: game.bronze_threshold,
    };

    // Calculate stats (prev and current)
    for (user_id, matches) in user_groups {
        let user_name = matches[0].name.clone();
        let user_avatar = matches[0].avatar.clone();
        let user_avatar_colour = matches[0].avatar_colour.clone();

        let current_stats = calculate_stats(&matches, &thresholds);

        entries.push(ScoreboardEntry {
            user_id,
            user_name: user_name.clone(),
            user_avatar: user_avatar.clone(),
            user_avatar_colour: user_avatar_colour.clone(),
            matches_played: current_stats.matches_played,
            average_score: current_stats.average_score,
            best_score: current_stats.best_score,
            wins: current_stats.wins,
            win_rate: current_stats.win_rate,
            star_medals: current_stats.medals.star,
            gold_medals: current_stats.medals.gold,
            silver_medals: current_stats.medals.silver,
            bronze_medals: current_stats.medals.bronze,
            rank: 0,
            rank_diff: 0,
            average_score_diff: 0.0,
            win_rate_diff: 0.0,
        });

        // Calculate previous stats
        let prev_matches: Vec<_> = matches
            .into_iter()
            .filter(|m| m.match_id != most_recent_match)
            .collect();

        let prev_stats = calculate_stats(&prev_matches, &thresholds);

        prev_entries.push(ScoreboardEntry {
            user_id,
            user_name,
            user_avatar,
            user_avatar_colour,
            matches_played: prev_stats.matches_played,
            average_score: prev_stats.average_score,
            best_score: prev_stats.best_score,
            wins: prev_stats.wins,
            win_rate: prev_stats.win_rate,
            star_medals: prev_stats.medals.star,
            gold_medals: prev_stats.medals.gold,
            silver_medals: prev_stats.medals.silver,
            bronze_medals: prev_stats.medals.bronze,
            rank: 0,
            rank_diff: 0,
            average_score_diff: 0.0,
            win_rate_diff: 0.0,
        });
    }

    // Sort using your comparator
    let metric_ordering: OrderBy = game.metric.into();
    entries.sort_by(|a, b| get_comparator(metric_ordering, a, b));
    prev_entries.sort_by(|a, b| get_comparator(metric_ordering, a, b));

    let prev_lookup: HashMap<Uuid, _> = prev_entries
        .into_iter()
        .enumerate()
        .map(|(idx, stats)| {
            (
                stats.user_id,
                (idx + 1, stats.average_score, stats.win_rate),
            )
        })
        .collect();

    // Calculate changes
    for (index, entry) in entries.iter_mut().enumerate() {
        let current_rank = index + 1;

        if let Some((prev_rank, prev_average_score, prev_win_rate)) =
            prev_lookup.get(&entry.user_id)
        {
            entry.rank = current_rank as i32;
            entry.rank_diff = *prev_rank as i32 - current_rank as i32;
            entry.average_score_diff = entry.average_score - prev_average_score;
            entry.win_rate_diff = entry.win_rate - prev_win_rate;
        }
    }

    entries
}
