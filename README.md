# Sienna Pay - USDC Payroll App on Solana

A modern, user-friendly payroll application that allows users to send USDC payments on the Solana blockchain to employees, contractors, and friends.

## Features

- **Connect your Solana wallet**: Seamless integration with popular Solana wallets (Phantom, Solflare, Glow, Backpack, and Sollet)
- **Manage payees**: Add, edit, and delete recipients with detailed information
- **Send individual payments**: Quick and easy USDC transfers to any Solana wallet address
- **Batch payments & payroll**: Select multiple payees and pay them all at once
- **Transaction history**: View and search your payment history
- **Export functionality**: Export transaction data to CSV for accounting purposes
- **Mobile responsive**: Fully functional on both desktop and mobile devices

## Technology Stack

- **Frontend**: React.js with React Router for navigation
- **Styling**: Tailwind CSS for modern, responsive design
- **Blockchain**: Solana Web3.js for blockchain interaction
- **Wallet**: Solana Wallet Adapter for wallet connectivity
- **Storage**: Local storage for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sienna-pay.git
   cd sienna-pay
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Select your preferred Solana wallet
3. Approve the connection request in your wallet

### Adding Payees

1. Navigate to the "Payees" section
2. Click "Add New Payee"
3. Fill in the payee details (name, wallet address, etc.)
4. Click "Add Payee" to save

### Sending Payments

#### Individual Payment:
1. Find the payee you want to pay
2. Click the "Pay Now" button
3. Enter the amount and memo
4. Click "Send Payment"

#### Batch Payments/Payroll:
1. Navigate to the "Payroll" section
2. Enter a name for your payroll run
3. Select the payees you want to include
4. Adjust amounts if needed
5. Click "Run Payroll"

### Viewing Transaction History

1. Navigate to the "History" section
2. Use the search bar to find specific transactions
3. Filter by incoming or outgoing payments
4. Export your transaction history to CSV if needed

## Development

### Project Structure

```
sienna-pay/
├── public/               # Static files
├── src/
│   ├── assets/           # Images and other assets
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts for state management
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.js            # Main App component
│   └── index.js          # Entry point
└── package.json          # Project dependencies and scripts
```

## Notes

- This application is configured to use the Solana devnet. For production use, you would need to update the network in `src/contexts/WalletContext.js`.
- USDC transfers require USDC tokens on the corresponding Solana network.

## License

MIT

## Acknowledgements

- Solana Foundation for the excellent developer tools
- The React and Tailwind CSS communities
