use crate::AppState;
use crate::errors::{AppError, GameError, GroupError};
use crate::models::game::{CreateGameReq, GameDb, UpdateGameReq};
use crate::models::group::GroupMemberDb;
use crate::policies::GroupAction;

use uuid::Uuid;

pub async fn create_game(
    state: &AppState,
    member: GroupMemberDb,
    payload: CreateGameReq,
) -> Result<GameDb, AppError> {
    if !member.role.can_perform(GroupAction::CreateGame) {
        return Err(GroupError::Forbidden.into());
    }

    let game = state
        .game_repo
        .create(
            &state.pool,
            member.group_id,
            &payload.name,
            payload.players_per_match,
            payload.metric,
        )
        .await
        .map_err(GameError::Database)?;

    Ok(game)
}

pub async fn update_game(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
    payload: UpdateGameReq,
) -> Result<GameDb, AppError> {
    let (game, member) = fetch_game_guarded(state, game_id, user_id).await?;
    if !member.role.can_perform(GroupAction::UpdateGame) {
        return Err(GroupError::Forbidden.into());
    }

    let game = state
        .game_repo
        .update(
            &state.pool,
            game.id,
            &payload.name,
            payload.players_per_match,
            payload.metric,
        )
        .await
        .map_err(GameError::Database)?;

    Ok(game)
}

pub async fn get(state: &AppState, user_id: Uuid, game_id: Uuid) -> Result<GameDb, AppError> {
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;
    Ok(game)
}

pub async fn get_last_players(
    state: &AppState,
    user_id: Uuid,
    game_id: Uuid,
) -> Result<Vec<Uuid>, AppError> {
    let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

    let last_players = state
        .group_repo
        .get_last_players(&state.pool, game.id)
        .await?;

    Ok(last_players)
}

pub async fn fetch_game_guarded(
    state: &AppState,
    game_id: Uuid,
    user_id: Uuid,
) -> Result<(GameDb, GroupMemberDb), AppError> {
    let game = state
        .game_repo
        .get(&state.pool, game_id)
        .await?
        .ok_or(GameError::NotFound)?;

    // Check user is member of group
    let member = state
        .group_repo
        .get_member(&state.pool, game.group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    Ok((game, member))
}
