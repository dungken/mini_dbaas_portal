use bcrypt::{hash, verify, DEFAULT_COST};

/// Hash password bằng bcrypt
/// 
/// # Arguments
/// * `password` - Plain text password cần hash
/// 
/// # Returns
/// * `Ok(String)` - Hashed password
/// * `Err(bcrypt::BcryptError)` - Lỗi khi hash
/// 
/// # Example
/// ```
/// use utils::password::hash_password;
/// 
/// let hashed = hash_password("my_secure_password")?;
/// ```
pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

/// Verify password với hash
/// 
/// # Arguments
/// * `password` - Plain text password cần verify
/// * `hash` - Hashed password để so sánh
/// 
/// # Returns
/// * `Ok(bool)` - `true` nếu password đúng, `false` nếu sai
/// * `Err(bcrypt::BcryptError)` - Lỗi khi verify
/// 
/// # Example
/// ```
/// use utils::password::{hash_password, verify_password};
/// 
/// let hashed = hash_password("my_secure_password")?;
/// let is_valid = verify_password("my_secure_password", &hashed)?;
/// assert!(is_valid);
/// ```
pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_password() {
        let password = "test_password_123";
        
        // Hash password
        let hashed = hash_password(password).expect("Failed to hash password");
        assert!(!hashed.is_empty());
        
        // Verify với password đúng
        let is_valid = verify_password(password, &hashed)
            .expect("Failed to verify password");
        assert!(is_valid);
        
        // Verify với password sai
        let is_invalid = verify_password("wrong_password", &hashed)
            .expect("Failed to verify password");
        assert!(!is_invalid);
    }
}

