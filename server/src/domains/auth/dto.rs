use std::collections::HashSet;

use serde::Deserialize;
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[validate(email)]
    pub email: String,
    #[validate(
        length(min = 12, max = 1023),
        custom(function = "validate_password", code = "common")
    )]
    pub password: String,
}

lazy_static::lazy_static! {
    static ref COMMON_PASSWORDS: HashSet<&'static str> = {
        let list = include_str!("../../data/common_passwords.txt");
        list.lines().collect()
    };
}

fn validate_password(password: &str) -> Result<(), ValidationError> {
    if COMMON_PASSWORDS.contains(password.trim().to_lowercase().as_str()) {
        return Err(ValidationError::new("common_password"));
    }

    Ok(())
}
