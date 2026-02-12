use crate::{
    AppState,
    errors::{AppError, GameError, GroupError},
    models::{
        game::ScoringMetric,
        stats::{
            HighlightsResponse, OrderDir, PlayerMatchDb, PlayerStatsSummary, RawMatchStats,
            Scoreboard, ScoreboardEntry,
        },
    },
};
use std::collections::HashMap;
use uuid::Uuid;

pub async fn get_scoreboard(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    order_by: Option<ScoringMetric>,
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

    // Raw match data (last `n` matches for each player)
    let raw_data = state
        .stats_repo
        .get_all_matches(&state.pool, game_id)
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
        let user_avatar = matches[0].avatar.clone();
        let user_avatar_colour = matches[0].avatar_colour.clone();

        let total_wins = matches.iter().filter(|m| m.rank_in_match == 1).count();
        let win_rate = total_wins as f64 / matches_played as f64;

        entries.push(ScoreboardEntry {
            user_id,
            user_name,
            user_avatar,
            user_avatar_colour,
            matches_played,
            average_score: avg_score,
            wins: total_wins as i64,
            win_rate,
        });
    }

    let get_comparator = |metric: ScoringMetric, a: &ScoreboardEntry, b: &ScoreboardEntry| {
        match metric {
            ScoringMetric::WinRate => a
                .win_rate
                .total_cmp(&b.win_rate)
                .then_with(|| a.matches_played.cmp(&b.matches_played))
                .then_with(|| a.average_score.total_cmp(&b.average_score)),

            ScoringMetric::AverageScore => a
                .average_score
                .total_cmp(&b.average_score)
                .then_with(|| a.matches_played.cmp(&b.matches_played))
                .then_with(|| a.win_rate.total_cmp(&b.win_rate)),
        }
        .then_with(|| a.user_name.cmp(&b.user_name))
        .reverse() // Default to descending
    };

    // Take podium as top 3 based on game metric
    entries.sort_by(|a, b| get_comparator(game.metric, a, b));
    let podium: Vec<ScoreboardEntry> = entries.iter().take(3).cloned().collect();

    // If user wants different sort than metric, sort the entries by that
    let order_by = order_by.unwrap_or(game.metric);
    if order_by != game.metric {
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

pub async fn get_player_summary(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    player_id: Uuid,
) -> Result<PlayerStatsSummary, AppError> {
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

    let lifetime_stats = state
        .stats_repo
        .get_lifetime_stats(&state.pool, game_id, player_id)
        .await?;

    let stats = PlayerStatsSummary {
        lifetime: lifetime_stats,
    };

    Ok(stats)
}
