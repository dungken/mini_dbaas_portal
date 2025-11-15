use jsonwebtoken::{encode, decode, Header, Algorithm, EncodingKey, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Claims trong JWT token
/// Chứa thông tin user được encode trong token
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// User ID
    pub user_id: i32,
    
    /// Tenant ID
    pub tenant_id: i32,
    
    /// Role của user (Viewer, Developer, Tenant Admin, etc.)
    pub role: String,
    
    /// Issued at - Thời điểm token được tạo (Unix timestamp)
    pub iat: u64,
    
    /// Expiration time - Thời điểm token hết hạn (Unix timestamp)
    pub exp: u64,
}

impl Claims {
    /// Tạo Claims mới
    /// 
    /// # Arguments
    /// * `user_id` - User ID
    /// * `tenant_id` - Tenant ID
    /// * `role` - Role của user
    /// * `expiration_hours` - Số giờ token có hiệu lực (mặc định: 12 giờ)
    /// 
    /// # Returns
    /// `Claims` mới với iat và exp được set tự động
    pub fn new(user_id: i32, tenant_id: i32, role: String, expiration_hours: u64) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let exp = now + (expiration_hours * 3600); // expiration_hours * 3600 seconds
        
        Claims {
            user_id,
            tenant_id,
            role,
            iat: now,
            exp,
        }
    }
}

/// Tạo JWT token
/// 
/// # Arguments
/// * `claims` - Claims cần encode vào token
/// * `secret` - Secret key để sign token
/// 
/// # Returns
/// * `Ok(String)` - JWT token string
/// * `Err(jsonwebtoken::errors::Error)` - Lỗi khi encode
/// 
/// # Example
/// ```
/// use utils::jwt::{create_token, Claims};
/// 
/// let claims = Claims::new(1, 1, "Viewer".to_string(), 12);
/// let token = create_token(&claims, "secret_key")?;
/// ```
pub fn create_token(claims: &Claims, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let header = Header::new(Algorithm::HS256);
    let key = EncodingKey::from_secret(secret.as_ref());
    
    encode(&header, claims, &key)
}

/// Verify và decode JWT token
/// 
/// # Arguments
/// * `token` - JWT token string cần verify
/// * `secret` - Secret key để verify token
/// 
/// # Returns
/// * `Ok(Claims)` - Claims từ token nếu valid
/// * `Err(jsonwebtoken::errors::Error)` - Lỗi khi verify/decode
/// 
/// # Example
/// ```
/// use utils::jwt::{verify_token, Claims};
/// 
/// let claims = verify_token(&token, "secret_key")?;
/// println!("User ID: {}", claims.user_id);
/// ```
pub fn verify_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::new(Algorithm::HS256);
    
    let token_data = decode::<Claims>(token, &key, &validation)?;
    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_verify_token() {
        let secret = "test_secret_key";
        let claims = Claims::new(1, 1, "Viewer".to_string(), 1); // 1 hour expiration
        
        // Tạo token
        let token = create_token(&claims, secret)
            .expect("Failed to create token");
        assert!(!token.is_empty());
        
        // Verify token
        let decoded_claims = verify_token(&token, secret)
            .expect("Failed to verify token");
        
        assert_eq!(decoded_claims.user_id, claims.user_id);
        assert_eq!(decoded_claims.tenant_id, claims.tenant_id);
        assert_eq!(decoded_claims.role, claims.role);
    }
}

