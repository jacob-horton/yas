use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

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
