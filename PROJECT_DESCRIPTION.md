# Music Player dApp

## Project Description
A decentralized music player built on Solana that allows users to upload tracks, create playlists, and manage their music library on-chain.

**Solana Program ID:** [TODO: Your deployed program's public key]

## Project Overview

### Description
[TODO: Provide a comprehensive description of your dApp. Explain what it does. Be detailed about the core functionality.]

### Key Features
[TODO: List the main features of your dApp. Be specific about what users can do.]

- Feature 1: [Description]
- Feature 2: [Description]
- ...
  
### How to Use the dApp
[TODO: Provide step-by-step instructions for users to interact with your dApp]

1. **Connect Wallet**
2. **Main Action 1:** [Step-by-step instructions]
3. **Main Action 2:** [Step-by-step instructions]
4. ...

## Program Architecture
[TODO: Describe your Solana program's architecture. Explain the main instructions, account structures, and data flow.]

### PDA Usage
[TODO: Explain how you implemented Program Derived Addresses (PDAs) in your project. What seeds do you use and why?]

**PDAs Used:**
- PDA 1: [Purpose and description]
- PDA 2: [Purpose and description]

### Program Instructions
[TODO: List and describe all the instructions in your Solana program]

**Instructions Implemented:**
- Instruction 1: [Description of what it does]
- Instruction 2: [Description of what it does]
- ...

### Account Structure
[TODO: Describe your main account structures and their purposes]

```rust
// Example account structure (replace with your actual structs)
#[account]
pub struct YourAccountName {
    // Describe each field
}
```

## Testing

### Test Coverage
Comprehensive testing approach covering happy paths, unhappy paths, and edge cases to ensure robust functionality and security.

**Happy Path Tests:**
- **User Profile Initialization**: Tests successful user profile creation with valid username and email
- **Track Upload**: Tests complete track upload with all required metadata (title, artist, genre, URI)
- **Playlist Creation**: Tests playlist creation with name and description
- **Track Management**: Tests adding and removing tracks from playlists successfully

**Unhappy Path Tests:**
- **Validation Errors**: Tests username length limits and empty field handling
- **Authorization Errors**: Tests access restrictions for playlist operations
- **State Errors**: Tests operations on invalid states (e.g., removing from empty playlist)

**Edge Case Tests:**
- **Boundary Values**: Tests reasonable length strings and boundary conditions
- **Special Characters**: Tests handling of special characters, emojis, and numbers in text fields

### Running Tests
```bash
# Run all tests
anchor test

# Run with verbose output
anchor test --verbose
```

### Test Results
Tests demonstrate:
- ✅ Proper account creation and state management
- ✅ Correct PDA derivation and usage
- ✅ Proper error handling and validation
- ✅ Security constraints enforcement
- ✅ Edge case handling

### Additional Notes for Evaluators

[TODO: Add any specific notes or context that would help evaluators understand your project better]