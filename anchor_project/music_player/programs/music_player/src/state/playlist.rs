use anchor_lang::prelude::*;

#[account]

pub struct Playlist {
    pub id: u64,
    pub owner: Pubkey,
    pub name: String,
    pub description: String,
    pub tracks: Vec<u64>, // List of track IDs
    pub created_at: i64,
    pub updated_at: i64,
}