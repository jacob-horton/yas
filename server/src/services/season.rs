use crate::{AppState, errors::AppError};

// NOTE: this should not accessible from the external API, only interval (clean up job)
pub async fn check_and_update_seasons(state: &AppState) -> Result<(), AppError> {
    let mut tx = state.pool.begin().await?;

    // Check all seasons that have expired
    let mut expired_seasons = state.season_repo.expired_seasons(&mut tx).await?;

    while !expired_seasons.is_empty() {
        // Create new seasons for all the expired ones
        for season in &expired_seasons {
            state.season_repo.new_season(&mut tx, season).await?;
        }

        // If multiple seasons have passed since last interval, create them all
        expired_seasons = state.season_repo.expired_seasons(&mut tx).await?;
    }

    tx.commit().await?;

    Ok(())
}
