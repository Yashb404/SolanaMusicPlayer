//user_profile.rs

use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub user: Pubkey,       // Owner of this profile
    pub username: String,   // Fixed space allocated
    pub email: String,      // Fixed space allocated
    pub created_at: i64,
    pub updated_at: i64,
}

impl UserProfile {
    pub const MAX_USERNAME_LEN: usize = 32; // adjust as needed
    pub const MAX_EMAIL_LEN: usize = 64;

    pub const LEN: usize = 8   // discriminator
        + 32                   // user pubkey
        + 4 + Self::MAX_USERNAME_LEN // string prefix + username
        + 4 + Self::MAX_EMAIL_LEN   // string prefix + email
        + 8                    // created_at
        + 8;                   // updated_at
}
