use crate::{
    AppState,
    errors::{AppError, GroupError, StatsError, UserError},
    models::{
        game::{GameDb, OrderBy},
        stats::{
            Distribution, DistributionWithMaxMin, HighlightsResponse, OrderDir, Player,
            PlayerHighlightStats, PlayerMatchDb, RawMatchStats, Scoreboard, ScoreboardEntry,
            StatsLifetime,
        },
        user::UserDb,
    },
    services::{game::fetch_game_guarded},
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
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;
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

#[derive(Debug, Clone, Default)]
struct Medals {
    star: u32,
    gold: u32,
    silver: u32,
    bronze: u32,
}

impl Medals {
    fn count_medal(&mut self, score: i32, thresholds: &MedalsThresholds) {
        if thresholds.star.is_some_and(|t| score >= t) {
            self.star += 1;
        } else if thresholds.gold.is_some_and(|t| score >= t) {
            self.gold += 1;
        } else if thresholds.silver.is_some_and(|t| score >= t) {
            self.silver += 1;
        } else if thresholds.bronze.is_some_and(|t| score >= t) {
            self.bronze += 1;
        }
    }
}

pub struct MedalsThresholds {
    pub star: Option<i32>,
    pub gold: Option<i32>,
    pub silver: Option<i32>,
    pub bronze: Option<i32>,
}

#[derive(Debug, Clone, Default)]
struct PlayerStats {
    matches_played: i64,
    average_score: f64,
    wins: i64,
    best_score: i32,
    win_rate: f64,

    medals: Medals,
}

fn calculate_stats(matches: &[RawMatchStats], thresholds: MedalsThresholds) -> PlayerStats {
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

        stats.medals.count_medal(m.score, &thresholds);
    }

    stats.matches_played = count;
    stats.average_score = sum_score as f64 / count as f64;
    stats.win_rate = stats.wins as f64 / count as f64;

    stats
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
        let current_stats = calculate_stats(
            &matches,
            MedalsThresholds {
                star: game.star_threshold,
                gold: game.gold_threshold,
                silver: game.silver_threshold,
                bronze: game.bronze_threshold,
            },
        );

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

        // Calculate previous stats (before the most recent game)
        let prev_matches: Vec<_> = matches
            .into_iter()
            .filter(|m| m.match_id != most_recent_match)
            .collect();

        let prev_stats = calculate_stats(
            &prev_matches,
            MedalsThresholds {
                star: game.star_threshold,
                gold: game.gold_threshold,
                silver: game.silver_threshold,
                bronze: game.bronze_threshold,
            },
        );

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
) -> Result<(Vec<PlayerMatchDb>, UserDb), AppError> {
    // Checks user is a member of the group
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

    // Check if logged in user shares a group with lookup user for privacy
    let shares_group = state
        .group_repo
        .users_share_group(&state.pool, user_id, player_id)
        .await?;

    if !shares_group {
        return Err(GroupError::MemberNotFound.into());
    }

    let player_history = state
        .stats_repo
        .get_player_history(&state.pool, game.id, player_id)
        .await?;

    // TODO: check above will error if user not found
    let player = state
        .user_repo
        .find_by_id(&state.pool, &player_id)
        .await?
        .ok_or(UserError::NotFound)?;

    Ok((player_history, player))
}

pub async fn get_player_highlights(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    player_id: Uuid,
) -> Result<PlayerHighlightStats, AppError> {
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

    // Check if logged in user shares a group with lookup user for privacy
    let shares_group = state
        .group_repo
        .users_share_group(&state.pool, user_id, player_id)
        .await?;

    if !shares_group {
        return Err(GroupError::MemberNotFound.into());
    }

    let scoreboard = get_scoreboard_entries(state, &game).await?;
    let (rank_index, entry) = scoreboard
        .iter()
        .enumerate()
        .find(|(_, entry)| entry.user_id == player_id)
        .ok_or(StatsError::NotEnoughData)?;

    let stats = PlayerHighlightStats {
        player: Player {
            id: entry.user_id,
            name: entry.user_name.clone(),
            avatar: entry.user_avatar.clone(),
            avatar_colour: entry.user_avatar_colour.clone(),
        },
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
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

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
