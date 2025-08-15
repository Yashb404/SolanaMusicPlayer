use anchor_lang::prelude::*;
use crate::state::user_profile::UserProfile;
use crate::errors::ErrorCode;

pub fn handler(
    ctx: Context<InitializeUser>,
    username: String,
    email: String,
) -> Result<()> {
    // validate lengths
    require!(
        username.len() <= UserProfile::MAX_USERNAME_LEN,
        ErrorCode::UsernameTooLong
    );
    require!(
        email.len() <= UserProfile::MAX_EMAIL_LEN,
        ErrorCode::EmailTooLong
    );

    let profile = &mut ctx.accounts.user_profile;
    let clock = Clock::get()?;

    profile.user = ctx.accounts.signer.key();
    profile.username = username;
    profile.email = email;
    profile.created_at = clock.unix_timestamp;
    profile.updated_at = clock.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = signer,
        space = UserProfile::LEN,
        seeds = [b"user-profile", signer.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
