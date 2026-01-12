use sqlx::types::Uuid;

use crate::AppState;

use crate::errors::{AppError, GroupError};
use crate::models::game::{CreateGameReq, GameDb};
use crate::policies::GroupAction;

pub async fn create_game(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
    payload: CreateGameReq,
) -> Result<GameDb, AppError> {
    let member = state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !member.role.can_perform(GroupAction::CreateGame) {
        return Err(GroupError::Forbidden.into());
    }

    let game = state
        .game_repo
        .create(
            &state.pool,
            group_id,
            &payload.name,
            payload.players_per_match,
        )
        .await
        .map_err(GroupError::Database)?;

    Ok(game)
}
