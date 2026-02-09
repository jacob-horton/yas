use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, Type, PartialEq, Eq)]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum Avatar {
    Basketball,
    Bear,
    Bomb,
    Controller,
    Crab,
    Frog,
    Ghost,
    Headphones,
    Helmet,
    Lightbulb,
    Octopus,
    Penguin,
    Pizza,
    Planet,
    Robot,
    Rocket,
    Wizard,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type, PartialEq, Eq)]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum AvatarColour {
    Red,
    Orange,
    Amber,
    Yellow,
    Lime,
    Green,
    Emerald,
    Teal,
    Cyan,
    Sky,
    Blue,
    Indigo,
    Violet,
    Purple,
    Fuchsia,
    Pink,
    Rose,
    Slate,
}

#[derive(Debug, FromRow)]
pub struct UserDb {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub created_at: String,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}

impl From<UserDb> for UserResponse {
    fn from(user: UserDb) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at.to_rfc3339(),
            avatar: user.avatar,
            avatar_colour: user.avatar_colour,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PublicUserDetailsResponse {
    pub id: Uuid,
    pub name: String,
}

impl From<UserDb> for PublicUserDetailsResponse {
    fn from(user: UserDb) -> Self {
        Self {
            id: user.id,
            name: user.name,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserReq {
    #[validate(email(message = "Email must be valid"))]
    pub email: String,
    #[validate(length(min = 1, max = 512, message = "Name must be between 1 and 512 chars"))]
    pub name: String,
    #[validate(length(
        min = 8,
        max = 1023,
        message = "Password must be between 8 and 1023 chars"
    ))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateUserReq {
    #[validate(email(message = "Email must be valid"))]
    pub email: String,
    #[validate(length(min = 1, max = 512, message = "Name must be between 1 and 512 chars"))]
    pub name: String,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}
