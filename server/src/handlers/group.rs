use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{delete, get, post, put},
};
use tower::ServiceBuilder;
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{
        auth_member::AuthMember,
        rate_limiting::ip::{create_ip_limiter, ip_limit_mw},
        validated_json::ValidatedJson,
        verified_member::VerifiedMember,
        verified_user::VerifiedUser,
    },
    models::{
        group::{
            CreateGroupReq, GroupMembersParams, GroupResponse, GroupWithRoleResponse, OrderBy,
            SetRoleReq, UpdateGroupReq,
        },
        stats::OrderDir,
    },
    services,
};

async fn create_group(
    user: VerifiedUser,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateGroupReq>,
) -> Result<impl IntoResponse, AppError> {
    let group = services::group::create_group(&state, user.id, payload).await?;

    let response: GroupResponse = group.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_group_details(
    AuthMember(member): AuthMember,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let group = services::group::get_group(&state, member).await?;

    let response: GroupWithRoleResponse = group.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn update_group(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<UpdateGroupReq>,
) -> Result<impl IntoResponse, AppError> {
    services::group::update_group(&state, member, payload).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn delete_group(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    services::group::delete_group(&state, member).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn get_group_members(
    AuthMember(member): AuthMember,
    State(state): State<AppState>,
    Query(query): Query<GroupMembersParams>,
) -> Result<impl IntoResponse, AppError> {
    let order_by = query.order_by.unwrap_or(OrderBy::Name);
    let order_dir = query.order_dir.unwrap_or(match order_by {
        OrderBy::Name | OrderBy::Email | OrderBy::JoinedAt => OrderDir::Ascending,
        OrderBy::Role => OrderDir::Descending,
    });

    let response = services::group::get_group_members(&state, member, order_by, order_dir).await?;

    Ok((StatusCode::OK, Json(response)))
}

async fn remove_group_member(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
    Path((_, member_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    services::group::remove_group_member(&state, member, member_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn set_member_role(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
    Path((_, member_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<SetRoleReq>,
) -> Result<impl IntoResponse, AppError> {
    services::group::set_member_role(&state, member, member_id, payload.role).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/groups",
            post(create_group).layer(
                ServiceBuilder::new()
                    .layer(Extension(create_ip_limiter(5, 60 * 60)))
                    .layer(middleware::from_fn(ip_limit_mw)),
            ),
        )
        .route("/groups/:group_id", get(get_group_details))
        .route("/groups/:group_id", put(update_group))
        .route("/groups/:group_id", delete(delete_group))
        .route("/groups/:group_id/members", get(get_group_members))
        .route(
            "/groups/:group_id/member/:member_id",
            delete(remove_group_member),
        )
        .route(
            "/groups/:group_id/member/:member_id/role",
            put(set_member_role),
        )
}
