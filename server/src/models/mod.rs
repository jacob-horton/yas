pub mod auth;
pub mod game;
pub mod game_match;
pub mod group;
pub mod invite;
pub mod stats;
pub mod user;

use serde::{Deserialize, Deserializer};

fn trim_string<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    Ok(s.trim().to_string())
}
