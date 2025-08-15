use anchor_lang::prelude::*;

#[error_code]

pub enum MusicPlayerError {
    #[msg("Unauthorized action")]
    Unauthorized,

    #[msg("Playlist not found")]
    PlaylistNotFound,

    #[msg("Track not found")]
    TrackNotFound,

    #[msg("User profile not found")]
    UserProfileNotFound,

    #[msg("Invalid input data")]
    InvalidInputData,

    #[msg("Insufficient funds for transaction")]
    InsufficientFunds,

    #[msg("Operation not supported")]
    OperationNotSupported,
}