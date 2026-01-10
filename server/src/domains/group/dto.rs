use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::domains::user::model::DbUser;

use super::model::DbGroup;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Group {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl From<DbGroup> for Group {
    fn from(value: DbGroup) -> Self {
        Self {
            id: value.id,
            name: value.name,
            created_at: value.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

impl From<DbUser> for Player {
    fn from(value: DbUser) -> Self {
        Self {
            id: value.id,
            name: value.name,
            email: value.email,
            created_at: value.created_at,
        }
    }
}
