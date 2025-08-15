//user_profile.rs

use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub user: Pubkey,
    pub username: String,
    pub email: String,
    pub created_at: i64,
    pub updated_at: i64,
}