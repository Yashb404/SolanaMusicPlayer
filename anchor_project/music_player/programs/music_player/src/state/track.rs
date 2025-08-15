use anchor_lang::prelude::*;

#[account]

pub struct Track {
    pub id: u64,
    pub author: Pubkey,
    pub title: String,
    pub genre: String,
    pub uri: String,
    pub created_at: i64,
}