#[derive(Clone, Debug)]
pub struct DbScoreboard {
    pub id: i32,
    pub name: String,
    pub players_per_game: i32,
    pub group_id: i32,
}

#[derive(Clone, Debug)]
pub struct PlayerScore {
    pub user_id: i32,
    pub points_per_game: f64,
    pub win_percent: i32,
}
