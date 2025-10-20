use chrono::{DateTime, Utc};

pub struct DbScore {
    pub name: String,
    pub win_percent: i32,
    pub points_per_game: f64,
}

pub struct DbGroup {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime<Utc>,
}
