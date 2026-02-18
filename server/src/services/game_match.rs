use crate::AppState;
use crate::errors::{AppError, GroupError, MatchError};
use crate::models::game_match::{CreateMatchReq, MatchDb, MatchScoreDb};
use crate::policies::GroupAction;
use crate::services::game::fetch_game_guarded;

use uuid::Uuid;

pub async fn create_match(
    state: &AppState,
    game_id: Uuid,
    user_id: Uuid,
    payload: CreateMatchReq,
) -> Result<MatchDb, AppError> {
    // Check user has permissions to create the match within the group
    let (game, member) = fetch_game_guarded(&state, game_id, user_id).await?;
    if !member.role.can_perform(GroupAction::CreateMatch) {
        return Err(GroupError::Forbidden.into());
    }

    if payload.scores.len() != game.players_per_match as usize {
        return Err(MatchError::IncorrectNumberOfScores.into());
    }

    let mut scores = Vec::with_capacity(payload.scores.len());
    let mut player_ids = Vec::with_capacity(payload.scores.len());

    for s in payload.scores {
        // Prevent duplicate scoring for the same user in one match
        if player_ids.contains(&s.user_id) {
            return Err(MatchError::DuplicatePlayer.into());
        }

        player_ids.push(s.user_id);

        scores.push(MatchScoreDb {
            user_id: s.user_id,
            score: s.score,
        })
    }

    let mut tx = state.pool.begin().await?;

    // Verify all users are members of the group
    let all_members = state
        .group_repo
        .are_members(&mut *tx, game.group_id, &player_ids)
        .await?;

    if !all_members {
        return Err(MatchError::OneOrMorePlayersNotMember.into());
    }

    let game_match = state
        .match_repo
        .create(&mut tx, game_id, scores)
        .await
        .map_err(MatchError::Database)?;

    tx.commit().await?;

    Ok(game_match)
}
