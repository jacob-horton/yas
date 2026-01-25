use sqlx::types::Uuid;

use crate::{
    AppState,
    errors::{AppError, GameError, GroupError},
    models::stats::{OrderBy, PlayerMatchDb, RawMatchStats, Scoreboard, ScoreboardEntry},
};
use std::{cmp::Ordering, collections::HashMap};

pub async fn get_scoreboard(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    num_matches: i32,
    order_by: OrderBy,
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

    // Raw match data (last `n` matches for each player)
    let raw_data = state
        .stats_repo
        .get_last_n_matches_per_player(&state.pool, game_id, num_matches)
        .await?;

    // Group by user
    let mut user_groups: HashMap<Uuid, Vec<RawMatchStats>> = HashMap::new();
    for row in raw_data {
        user_groups.entry(row.user_id).or_default().push(row);
    }

    let mut entries = Vec::new();

    // Calculate stats
    for (user_id, matches) in user_groups {
        let matches_played = matches.len() as i64;
        let avg_score = matches.iter().map(|m| m.score).sum::<i32>() as f64 / matches_played as f64;

        let user_name = matches[0].name.clone();

        let total_wins = matches.iter().filter(|m| m.rank_in_match == 1).count();
        let win_rate = total_wins as f64 / matches_played as f64;

        entries.push(ScoreboardEntry {
            user_id,
            matches_played,
            user_name,
            average_score: avg_score,
            wins: total_wins as i64,
            win_rate,
        });
    }

    // Sort
    entries.sort_by(|a, b| {
        let key = |s: &ScoreboardEntry| match order_by {
            OrderBy::WinRate => (s.win_rate, s.matches_played, s.average_score),
            OrderBy::AverageScore => (s.average_score, s.matches_played, s.win_rate),
        };

        let (b_primary, b_secondary, b_tertiary) = key(b);
        let (a_primary, a_secondary, a_tertiary) = key(a);

        b_primary
            .partial_cmp(&a_primary)
            .unwrap_or(Ordering::Equal)
            .then_with(|| {
                b_secondary
                    .partial_cmp(&a_secondary)
                    .unwrap_or(Ordering::Equal)
            })
            .then_with(|| {
                b_tertiary
                    .partial_cmp(&a_tertiary)
                    .unwrap_or(Ordering::Equal)
            })
    });

    let scoreboard = Scoreboard { entries, game };

    Ok(scoreboard)
}

pub async fn get_player_stats(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    player_id: Uuid,
    num_matches: i32,
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

    // Get last `n` games
    let last_n_games = state
        .stats_repo
        .get_last_n_matches_single_player(&state.pool, game_id, player_id, num_matches)
        .await?;

    Ok(last_n_games)
}
