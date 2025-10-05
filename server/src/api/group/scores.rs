use actix_web::{HttpResponse, Responder, get};
use serde::Serialize;

#[derive(Serialize)]
struct Score {
    name: String,
    win_percent: i32,
    points_per_game: f32,
}

#[get("/api/group/scores")]
pub async fn get_scores() -> impl Responder {
    let scores = vec![
        Score {
            name: String::from("Jane"),
            win_percent: 45,
            points_per_game: 56.78,
        },
        Score {
            name: String::from("John"),
            win_percent: 30,
            points_per_game: 12.34,
        },
        Score {
            name: String::from("Bill"),
            win_percent: 20,
            points_per_game: 5.55,
        },
        Score {
            name: String::from("Alex"),
            win_percent: 15,
            points_per_game: 4.44,
        },
    ];

    HttpResponse::Ok().json(scores)
}
