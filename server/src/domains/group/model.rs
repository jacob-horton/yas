use chrono::{DateTime, Utc};

#[derive(Clone, Debug)]
pub struct DbGroup {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime<Utc>,
}
