use actix_cors::Cors;
use actix_web::{App, HttpServer, http, web};
use api::{
    auth::{login::login, refresh::refresh},
    group::scores::get_scores,
    me::get_me,
};

mod api;
mod middleware;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:3000")
                    .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                    .allowed_headers(vec![http::header::CONTENT_TYPE])
                    .supports_credentials(),
            )
            .service(
                web::scope("/api")
                    .service(login)
                    .service(refresh)
                    .service(get_scores)
                    .service(get_me),
            )
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
