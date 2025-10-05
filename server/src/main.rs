use actix_cors::Cors;
use actix_web::{App, HttpServer};
use api::group::scores::get_scores;

mod api;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().wrap(Cors::permissive()).service(get_scores))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
