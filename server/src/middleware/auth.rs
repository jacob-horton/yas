use actix_web::http::StatusCode;
use actix_web::{Error, FromRequest, HttpRequest, dev::Payload};
use futures_util::future::{Ready, err, ok};
use jsonwebtoken::{DecodingKey, Validation, decode};

use crate::domains::auth::{
    model::AccessClaims,
    service::{ISSUER, SIGNING_KEY},
};

use super::errors::StatusError;

#[derive(Debug, Clone)]
pub struct AuthedUser {
    pub id: i32,
}

impl FromRequest for AuthedUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let cookie = req.cookie("access_token");
        match cookie {
            Some(access_token) => {
                let mut validation = Validation::default();
                validation.set_issuer(&[ISSUER]);

                let token = decode::<AccessClaims>(
                    access_token.value(),
                    &DecodingKey::from_secret(SIGNING_KEY.as_ref()),
                    &validation,
                );

                match token {
                    Ok(token) => ok(AuthedUser {
                        id: token
                            .claims
                            .sub
                            .parse()
                            .expect("Token is valid but ID is not an integer"),
                    }),
                    Err(_) => {
                        err(StatusError::new(
                            "Invalid access token",
                            StatusCode::UNAUTHORIZED,
                        )
                        .into())
                    }
                }
            }
            None => err(StatusError::new("No access token", StatusCode::UNAUTHORIZED).into()),
        }
    }
}
