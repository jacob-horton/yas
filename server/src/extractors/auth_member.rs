use axum::{
    async_trait,
    extract::{FromRequestParts, Path},
    http::request::Parts,
};
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, guarded_member::fetch_member_guarded},
    models::group::GroupMemberDb,
};

pub struct AuthMember(pub GroupMemberDb);

#[async_trait]
impl FromRequestParts<AppState> for AuthMember {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let AuthUser(user) = AuthUser::from_request_parts(parts, state).await?;

        let params = Path::<HashMap<String, String>>::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::InternalServerError("Failed to parse path parameters".into()))?;

        let group_id = params
            .get("group_id")
            .ok_or(AppError::InternalServerError(
                "Route missing :group_id parameter in path".into(),
            ))?
            .parse::<Uuid>()
            .map_err(|_| AppError::BadRequest("Invalid ID".into()))?;

        let member = fetch_member_guarded(state, user.id, group_id).await?;

        Ok(AuthMember(member))
    }
}
