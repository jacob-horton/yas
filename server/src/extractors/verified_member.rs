use axum::{
    async_trait,
    extract::{FromRequestParts, Path},
    http::request::Parts,
};
use std::{collections::HashMap, ops::Deref};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{guarded_member::fetch_member_guarded, verified_user::VerifiedUser},
    models::group::GroupMemberDb,
};

pub struct VerifiedMember(pub GroupMemberDb);

impl Deref for VerifiedMember {
    type Target = GroupMemberDb;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[async_trait]
impl FromRequestParts<AppState> for VerifiedMember {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let VerifiedUser(user) = VerifiedUser::from_request_parts(parts, state).await?;

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

        Ok(VerifiedMember(member))
    }
}
