use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ReportVitalReq {
    pub name: String,
    pub value: f64,
    pub rating: String,
    pub id: String,
    pub navigation_type: String,
    pub url: Option<String>,
}
