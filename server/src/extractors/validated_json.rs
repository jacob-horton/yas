use std::ops::Deref;

use axum::{
    Json, async_trait,
    extract::{FromRequest, Request},
};
use serde::de::DeserializeOwned;
use validator::Validate;

use crate::errors::AppError;

pub struct ValidatedJson<T>(pub T);

// Like `Json<_>` but also calls `validator::validate()` on the struct
#[async_trait]
impl<T, S> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(data) = Json::<T>::from_request(req, state)
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?;

        data.validate()
            .map_err(|e| AppError::BadRequest(e.to_string()))?;

        Ok(ValidatedJson(data))
    }
}

impl<T> Deref for ValidatedJson<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
