use bb8::Pool;
use bb8_postgres::PostgresConnectionManager;
use tokio_postgres::{Error, NoTls};

pub type DbPool = Pool<PostgresConnectionManager<tokio_postgres::NoTls>>;

pub async fn create_db_pool() -> Result<DbPool, Box<Error>> {
    let database_url = "host=localhost user=user password=password";

    let manager = PostgresConnectionManager::new(database_url.parse().unwrap(), NoTls);
    let pool = Pool::builder().build(manager).await?;

    Ok(pool)
}
