#[derive(Clone, Debug)]
pub struct DbScoreboard {
    pub id: i32,
    pub name: String,
    pub players_per_game: i32,
    pub group_id: i32,
}
