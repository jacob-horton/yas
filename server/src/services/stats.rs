use crate::{
    AppState,
    errors::{AppError, GameError, GroupError, StatsError},
    models::{
        game::{GameDb, OrderBy},
        stats::{
            Distribution, DistributionWithMaxMin, HighlightsResponse, OrderDir,
            PlayerHighlightStats, PlayerMatchDb, RawMatchStats, Scoreboard, ScoreboardEntry,
            StatsLifetime,
        },
    },
};
use std::{cmp::Ordering, collections::HashMap};
use uuid::Uuid;

const MIN_MATCHES_FOR_DISTRIBUTION: usize = 5;

fn get_comparator(order: OrderBy, a: &ScoreboardEntry, b: &ScoreboardEntry) -> Ordering {
    match order {
        OrderBy::WinRate => a
            .win_rate
            .total_cmp(&b.win_rate)
            .then_with(|| a.matches_played.cmp(&b.matches_played))
            .then_with(|| a.average_score.total_cmp(&b.average_score)),

        OrderBy::AverageScore => a
            .average_score
            .total_cmp(&b.average_score)
            .then_with(|| a.matches_played.cmp(&b.matches_played))
            .then_with(|| a.win_rate.total_cmp(&b.win_rate)),

        OrderBy::Name => a
            .user_name
            .cmp(&b.user_name)
            .then_with(|| a.win_rate.total_cmp(&b.win_rate))
            .then_with(|| a.matches_played.cmp(&b.matches_played))
            .then_with(|| a.average_score.total_cmp(&b.average_score)),
    }
    .then_with(|| a.user_name.cmp(&b.user_name))
    .reverse() // Default to descending
}

pub async fn get_scoreboard_and_stats(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    order_by: Option<OrderBy>,
    order_dir: Option<OrderDir>,
) -> Result<Scoreboard, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    let is_member = state
        .group_repo
        .are_members(&state.pool, game.group_id, &[user_id])
        .await?;

    if !is_member {
        return Err(GroupError::MemberNotFound.into());
    }

    let mut entries = get_scoreboard_entries(state, &game).await?;

    // Already sorted by game metric
    let podium: Vec<ScoreboardEntry> = entries.iter().take(3).cloned().collect();

    // If user wants different sort than metric, sort the entries by that
    let game_metric_ordering: OrderBy = game.metric.into();
    let order_by = order_by.unwrap_or(game_metric_ordering);
    if order_by != game_metric_ordering {
        entries.sort_by(|a, b| get_comparator(order_by, a, b));
    }

    // Flip if they want score ascending
    if order_dir == Some(OrderDir::Ascending) {
        entries.reverse();
    }

    let highlights: HighlightsResponse = state
        .stats_repo
        .get_highlights(&state.pool, game_id)
        .await?
        .into();

    let scoreboard = Scoreboard {
        entries,
        podium,
        highlights,
        game,
    };

    Ok(scoreboard)
}

struct PlayerStats {
    matches_played: i64,
    average_score: f64,
    wins: i64,
    best_score: i32,
    win_rate: f64,
}

fn calculate_stats(matches: &[RawMatchStats]) -> PlayerStats {
    let matches_played = matches.len() as i64;

    let sum_score: i32 = matches.iter().map(|m| m.score).sum();
    let best_score: i32 = matches.iter().map(|m| m.score).max().unwrap_or(0);

    let average_score = if matches_played > 0 {
        sum_score as f64 / matches_played as f64
    } else {
        0.0
    };

    let total_wins = matches.iter().filter(|m| m.rank_in_match == 1).count();
    let win_rate = total_wins as f64 / matches_played as f64;

    PlayerStats {
        matches_played,
        average_score,
        wins: total_wins as i64,
        best_score,
        win_rate,
    }
}

async fn get_scoreboard_entries(
    state: &AppState,
    game: &GameDb,
) -> Result<Vec<ScoreboardEntry>, AppError> {
    let raw_data = state
        .stats_repo
        .get_all_matches(&state.pool, game.id)
        .await?;

    if raw_data.is_empty() {
        return Ok(Vec::new());
    }

    let most_recent_match = raw_data.first().expect("No most recent game").match_id;

    // Group by user
    let mut user_groups: HashMap<Uuid, Vec<RawMatchStats>> = HashMap::new();
    for row in raw_data {
        user_groups.entry(row.user_id).or_default().push(row);
    }

    let mut entries = Vec::new();
    let mut prev_entries = Vec::new();

    // Calculate stats (prev and current)
    for (user_id, matches) in user_groups {
        let user_name = matches[0].name.clone();
        let user_avatar = matches[0].avatar.clone();
        let user_avatar_colour = matches[0].avatar_colour.clone();

        // Calculate current stats
        let current_stats = calculate_stats(&matches);
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

            rank: 0,

            rank_diff: 0,
            average_score_diff: 0.0,
            win_rate_diff: 0.0,
        });

        // Calculate previous stats (before the most recent game)
        let prev_matches: Vec<_> = matches
            .into_iter()
            .filter(|m| m.match_id != most_recent_match)
            .collect();
        let prev_stats = calculate_stats(&prev_matches);
        prev_entries.push(ScoreboardEntry {
            // TODO: a lot of data that isn't used here - maybe simplify?
            user_id,
            user_name: user_name.clone(),
            user_avatar: user_avatar.clone(),
            user_avatar_colour: user_avatar_colour.clone(),
            matches_played: prev_stats.matches_played,
            average_score: prev_stats.average_score,
            best_score: prev_stats.best_score,
            wins: prev_stats.wins,
            win_rate: prev_stats.win_rate,

            rank: 0,

            rank_diff: 0,
            average_score_diff: 0.0,
            win_rate_diff: 0.0,
        });
    }

    entries.sort_by(|a, b| get_comparator(game.metric.into(), a, b));
    prev_entries.sort_by(|a, b| get_comparator(game.metric.into(), a, b));

    // Easy lookup ID -> (rank, average_score, win_rate)
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

    Ok(entries)
}

pub async fn get_player_history(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    player_id: Uuid,
) -> Result<Vec<PlayerMatchDb>, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    let is_member = state
        .group_repo
        .are_members(&state.pool, game.group_id, &[user_id])
        .await?;

    if !is_member {
        return Err(GroupError::MemberNotFound.into());
    }

    let player_history = state
        .stats_repo
        .get_player_history(&state.pool, game_id, player_id)
        .await?;

    Ok(player_history)
}

pub async fn get_player_highlights(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    player_id: Uuid,
) -> Result<PlayerHighlightStats, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    let is_member = state
        .group_repo
        .are_members(&state.pool, game.group_id, &[user_id])
        .await?;

    if !is_member {
        return Err(GroupError::MemberNotFound.into());
    }

    let scoreboard = get_scoreboard_entries(state, &game).await?;
    let (rank_index, entry) = scoreboard
        .iter()
        .enumerate()
        .find(|(_, entry)| entry.user_id == player_id)
        .ok_or_else(|| GroupError::MemberNotFound)?;

    let stats = PlayerHighlightStats {
        lifetime: StatsLifetime {
            win_rate: entry.win_rate,
            average_score: entry.average_score,
            best_score: entry.best_score,
            total_games: entry.matches_played,
            rank: rank_index as i64 + 1,
        },
    };

    Ok(stats)
}

fn get_player_distribution(
    all_matches: &[RawMatchStats],
    player_id: Uuid,
) -> Result<DistributionWithMaxMin, AppError> {
    let player_data: Vec<_> = all_matches
        .iter()
        .filter(|m| m.user_id == player_id)
        .collect();

    if player_data.len() < MIN_MATCHES_FOR_DISTRIBUTION {
        return Err(StatsError::NotEnoughData.into());
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

pub async fn get_distributions(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
) -> Result<HashMap<Uuid, DistributionWithMaxMin>, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    let is_member = state
        .group_repo
        .are_members(&state.pool, game.group_id, &[user_id])
        .await?;

    if !is_member {
        return Err(GroupError::MemberNotFound.into());
    }

    let raw_data = state
        .stats_repo
        .get_all_matches(&state.pool, game.id)
        .await?;

    // TODO: just loop through raw data once - we don't need to know members
    let members = state
        .group_repo
        .get_members(
            &state.pool,
            game.group_id,
            crate::models::group::OrderBy::Name,
            OrderDir::Ascending,
        )
        .await?;

    let mut distributions = HashMap::<Uuid, DistributionWithMaxMin>::new();
    for player in members {
        // TODO: handle better. Skip players that don't have enough data, error if a different err
        if let Ok(dist) = get_player_distribution(&raw_data, player.id) {
            distributions.insert(player.id, dist);
        }
    }

    Ok(distributions)
}
