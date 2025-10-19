use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct MeResponse {
    pub id: i32,
    pub name: String,
    pub email: String,
}
