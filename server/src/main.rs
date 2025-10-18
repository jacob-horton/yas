use actix_cors::Cors;
use actix_web::{App, HttpServer, http, web};
use db::postgres::create_db_pool;
use domains::{auth, group, user};

mod db;
mod domains;
mod middleware;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = create_db_pool().await.unwrap();
    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:3000")
                    .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                    .allowed_headers(vec![http::header::CONTENT_TYPE])
                    .supports_credentials(),
            )
            .app_data(web::Data::new(pool.clone()))
            .service(
                web::scope("/api")
                    .configure(auth::controller::config)
                    .configure(user::controller::config)
                    .configure(group::controller::config),
            )
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
