use crate::AppState;
use crate::errors::{AppError, GameError, GroupError};
use crate::models::game::{CreateGameReq, GameDb};
use crate::policies::GroupAction;

use uuid::Uuid;

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
            payload.metric,
        )
        .await
        .map_err(GameError::Database)?;

    Ok(game)
}

pub async fn get(state: &AppState, user_id: Uuid, game_id: Uuid) -> Result<GameDb, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await
        .map_err(GameError::Database)?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    state
        .group_repo
        .get_member(&state.pool, game.group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    Ok(game)
}

pub async fn get_last_players(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
) -> Result<Vec<Uuid>, AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await
        .map_err(GameError::Database)?
        .ok_or(GameError::NotFound)?;

    // Check user is in group
    state
        .group_repo
        .get_member(&state.pool, game.group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    let last_players = state
        .group_repo
        .get_last_players(&state.pool, game_id)
        .await?;

    Ok(last_players)
}
