/// Application State - Chứa các resources được share giữa các handlers
/// Sử dụng Clone để có thể truy cập từ nhiều handlers đồng thời
#[derive(Clone, Debug)]
pub struct AppState {
  /// Environment (development, production, etc.)
  pub env: String,
  
  /// JWT Secret key (sẽ dùng cho task 27)
  pub jwt_secret: String,
  
  // Database pool (sẽ thêm ở task 25)
  // pub db_pool: sqlx::MySqlPool,
}

impl AppState {
  /// Tạo AppState mới từ environment variables
  pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
    // Load biến môi trường từ .env file
    dotenv::dotenv().ok();
    
    let env = std::env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default-secret-key-change-in-production".to_string());
    
    Ok(AppState {
      env,
      jwt_secret,
      // db_pool sẽ được thêm ở task 25
    })
  }
}