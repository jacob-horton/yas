use std::error::Error;
use std::fmt::{Display, Formatter};

use actix_web::http::StatusCode;
use actix_web::{HttpResponse, HttpResponseBuilder, ResponseError};

#[derive(Debug)]
pub struct StatusError {
    pub message: String,
    pub status_code: StatusCode,
}

impl StatusError {
    pub fn new(details: &str, status_code: StatusCode) -> Self {
        StatusError {
            message: details.to_owned(),
            status_code,
        }
    }
}

impl Display for StatusError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for StatusError {
    fn description(&self) -> &str {
        &self.message
    }
}

impl ResponseError for StatusError {
    fn error_response(&self) -> HttpResponse {
        HttpResponseBuilder::new(self.status_code())
            .content_type("text/plain; charset=utf-8")
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        self.status_code
    }
}
