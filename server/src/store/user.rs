use argon2::{Argon2, PasswordHash, PasswordVerifier};
use serde::Serialize;
use tokio_postgres::NoTls;

fn is_password_valid(password: &str, password_hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(password_hash).unwrap();
    return Argon2::default()
        .verify_password(password.as_ref(), &parsed_hash)
        .is_ok();
}

pub async fn login(email: &str, password: &str) -> Result<(i32, i32), ()> {
    // TODO: create connection at start and reuse
    let (client, connection) =
        tokio_postgres::connect("host=localhost user=user password=password", NoTls)
            .await
            .map_err(|_| ())?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let result = client
        .query(
            "SELECT id, email, password_hash, session_version FROM users WHERE email = $1::TEXT LIMIT 1",
            &[&email],
        )
        .await.map_err(|_| ())?;

    let user = result.first().ok_or(())?;

    let password_hash: &str = user.get("password_hash");
    if !is_password_valid(password, password_hash) {
        return Err(());
    }

    let id: i32 = user.get("id");
    let session_version: i32 = user.get("session_version");
    Ok((id, session_version))
}

#[derive(Debug, Clone, Serialize)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub session_version: i32,
}

pub async fn get_user(id: i32) -> Result<User, ()> {
    // TODO: create connection at start and reuse
    let (client, connection) =
        tokio_postgres::connect("host=localhost user=user password=password", NoTls)
            .await
            .map_err(|_| ())?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let result = client
        .query(
            "SELECT id, email, session_version FROM users WHERE id = $1 LIMIT 1",
            &[&id],
        )
        .await
        .map_err(|_| ())?;

    let user = result.first().ok_or(())?;

    Ok(User {
        id: user.get("id"),
        email: user.get("email"),
        session_version: user.get("session_version"),
    })
}
