use crate::{
    AppState,
    errors::{AppError, GroupError, StatsError, UserError},
    models::{
        game::{GameDb, OrderBy},
        stats::{
            DistributionWithMaxMin, HighlightsResponse, OrderDir, Player, PlayerHighlightStats,
            PlayerMatchDb, Scoreboard, ScoreboardEntry, StatsLifetime,
        },
        user::UserDb,
    },
    services::{game::fetch_game_guarded, stats::logic::build_scoreboard_entries},
};
use async_trait::async_trait;
use std::collections::HashMap;
use uuid::Uuid;

use super::StatsProvider;
use super::logic::{get_comparator, get_player_distribution};

pub struct DbStatsProvider;

impl DbStatsProvider {
    async fn get_scoreboard_entries(
        state: &AppState,
        game: &GameDb,
    ) -> Result<Vec<ScoreboardEntry>, AppError> {
        let raw_data = state
            .stats_repo
            .get_all_matches(&state.pool, game.id)
            .await?;

        Ok(build_scoreboard_entries(raw_data, game))
    }
}

#[async_trait]
impl StatsProvider for DbStatsProvider {
    async fn get_scoreboard_and_stats(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        order_by: Option<OrderBy>,
        order_dir: Option<OrderDir>,
    ) -> Result<Scoreboard, AppError> {
        let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;
        let mut entries = Self::get_scoreboard_entries(state, &game).await?;

        let podium: Vec<ScoreboardEntry> = entries.iter().take(3).cloned().collect();

        let game_metric_ordering: OrderBy = game.metric.into();
        let order_by = order_by.unwrap_or(game_metric_ordering);
        if order_by != game_metric_ordering {
            entries.sort_by(|a, b| get_comparator(order_by, a, b));
        }

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

    async fn get_player_history(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<(Vec<PlayerMatchDb>, UserDb), AppError> {
        let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

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

        let player = state
            .user_repo
            .find_by_id(&state.pool, &player_id)
            .await?
            .ok_or(UserError::NotFound)?;

        Ok((player_history, player))
    }

    async fn get_player_highlights(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<PlayerHighlightStats, AppError> {
        let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

        let shares_group = state
            .group_repo
            .users_share_group(&state.pool, user_id, player_id)
            .await?;

        if !shares_group {
            return Err(GroupError::MemberNotFound.into());
        }

        let scoreboard = Self::get_scoreboard_entries(state, &game).await?;
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

    async fn get_distributions(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
    ) -> Result<HashMap<Uuid, DistributionWithMaxMin>, AppError> {
        let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

        let raw_data = state
            .stats_repo
            .get_all_matches(&state.pool, game.id)
            .await?;

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
            if let Ok(dist) = get_player_distribution(&raw_data, player.id) {
                distributions.insert(player.id, dist);
            }
        }

        Ok(distributions)
    }
}
