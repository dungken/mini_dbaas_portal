use axum::{routing::{get, post}, Router, response::Json, extract::State};
use serde_json::{json, Value};
use std::net::SocketAddr;

mod state;
mod utils;

use state::AppState;
use utils::{password, jwt};

#[tokio::main]
async fn main() {
    // Load environment variables từ .env file
    dotenv::dotenv().ok();

    // Tạo AppState từ environment variables
    let app_state = AppState::new()
        .expect("Failed to create AppState");

    // Get port from environment variable or use default 3000
    let port = std::env::var("APP_PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .expect("APP_PORT phải là số hợp lệ");

    // Tạo router với AppState
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_check))
        .route("/config", get(config_handler))
        // Test endpoints cho bcrypt và jwt (chỉ để demo, sẽ xóa sau)
        .route("/test/password", post(test_password_handler))
        .route("/test/jwt", post(test_jwt_handler))
        // Thêm AppState vào router với .with_state()
        .with_state(app_state);
    
    // Create address to bind to
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    
    println!("🚀 Server is running on: http://{}", addr);
    println!("📝 Health check: http://{}/health", addr);
    println!("⚙️  Config: http://{}/config", addr);
    println!("🔐 Test Password: http://{}/test/password", addr);
    println!("🎫 Test JWT: http://{}/test/jwt", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Root handler
async fn root_handler() -> Json<Value> {
    Json(json!({
        "message": "Welcome to the CloudDB Manager API",
        "version": "1.0.0",
        "status": "running"
    }))
}

// Health check handler
async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "backend"
    }))
}

// Config handler - Ví dụ sử dụng AppState
async fn config_handler(State(state): State<AppState>) -> Json<Value> {
    Json(json!({
        "env": state.env,
        "jwt_secret_set": !state.jwt_secret.is_empty(),
        // Không hiển thị jwt_secret thực tế vì lý do bảo mật
    }))
}

// Test handler cho bcrypt password hashing (chỉ để demo)
async fn test_password_handler(Json(payload): Json<Value>) -> Json<Value> {
    let password = payload.get("password")
        .and_then(|v| v.as_str())
        .unwrap_or("default_password");
    
    match password::hash_password(password) {
        Ok(hashed) => {
            let is_valid = password::verify_password(password, &hashed)
                .unwrap_or(false);
            
            Json(json!({
                "success": true,
                "password": password,
                "hashed": hashed,
                "verified": is_valid
            }))
        }
        Err(e) => Json(json!({
            "success": false,
            "error": format!("Failed to hash password: {}", e)
        }))
    }
}

// Test handler cho JWT token (chỉ để demo)
async fn test_jwt_handler(State(state): State<AppState>) -> Json<Value> {
    // Tạo claims mẫu
    let claims = jwt::Claims::new(
        1,                              // user_id
        1,                              // tenant_id
        "Viewer".to_string(),           // role
        12                              // expiration_hours
    );
    
    match jwt::create_token(&claims, &state.jwt_secret) {
        Ok(token) => {
            // Verify token
            match jwt::verify_token(&token, &state.jwt_secret) {
                Ok(decoded_claims) => Json(json!({
                    "success": true,
                    "token": token,
                    "claims": {
                        "user_id": decoded_claims.user_id,
                        "tenant_id": decoded_claims.tenant_id,
                        "role": decoded_claims.role,
                        "iat": decoded_claims.iat,
                        "exp": decoded_claims.exp
                    }
                })),
                Err(e) => Json(json!({
                    "success": false,
                    "error": format!("Failed to verify token: {}", e)
                }))
            }
        }
        Err(e) => Json(json!({
            "success": false,
            "error": format!("Failed to create token: {}", e)
        }))
    }
}