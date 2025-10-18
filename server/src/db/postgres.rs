use bb8::Pool;
use bb8_postgres::PostgresConnectionManager;
use tokio_postgres::NoTls;

pub type DbPool = Pool<PostgresConnectionManager<tokio_postgres::NoTls>>;

#[derive(Debug, Clone)]
pub enum DbPoolErr {
    UrlParseError,
    BuildError,
}

pub async fn create_db_pool() -> Result<DbPool, DbPoolErr> {
    let database_url = "host=localhost user=user password=password";

    let manager = PostgresConnectionManager::new(
        database_url.parse().map_err(|_| DbPoolErr::UrlParseError)?,
        NoTls,
    );
    let pool = Pool::builder()
        .build(manager)
        .await
        .map_err(|_| DbPoolErr::BuildError)?;

    Ok(pool)
}
