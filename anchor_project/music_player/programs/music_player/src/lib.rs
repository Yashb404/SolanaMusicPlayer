use anchor_lang::prelude::*;

declare_id!("B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie");

#[program]
pub mod music_player {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
