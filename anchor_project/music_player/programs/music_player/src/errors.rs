use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
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

    // Custom length validation errors
    #[msg("Username exceeds maximum allowed length")]
    UsernameTooLong,

    #[msg("Email exceeds maximum allowed length")]
    EmailTooLong,

    #[msg("Track title exceeds maximum allowed length")]
    TrackTitleTooLong,

    #[msg("Artist name exceeds maximum allowed length")]
    ArtistTooLong,

    #[msg("Genre exceeds maximum allowed length")]
    GenreTooLong,
}
