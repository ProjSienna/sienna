# Sienna - USDC Payment Platform on Solana

**🚨 Update:** Active development has moved to a **private repository**. For access or inquiries, contact **shan@projectsienna.xyz**.

A modern, user-friendly financial platform enabling businesses, freelancers, and entrepreneurs to **send, request, and manage USDC payments** on the Solana blockchain with speed, low fees, and advanced financial tools.


## 🔹 Key Features

### 💳 Wallet & Payments
- **Wallet Integration**: Seamless connectivity with Solana wallets (Phantom, Solflare, Backpack, etc.)
- **Single & Batch Payments**: Send USDC to individuals or process bulk payouts (e.g., payroll, vendor payments)
- **Payment Requests**: Generate and send professional payment requests via email or shareable links
- **Invoice Management**: Create, track, and manage invoices with automatic payment reconciliation

### 📊 Financial Tools & Analytics
- **Yield Generation**: Earn interest on idle USDC via integrated DeFi protocols (e.g., Marinade, Kamino)
- **Growth Analytics**: Monitor transaction volume, cash flow trends, and business performance
- **Custom Reports**: Export detailed financial records for accounting, taxes, and audits

### ⚙️ Business Integrations
- **API Access**: Programmatically send, request, and track payments via Sienna's REST/Webhook API
- **Payment Gateway**: Embed USDC payment processing into websites, apps, or SaaS platforms
- **Web3 Commerce**: Accept Solana USDC payments for e-commerce, subscriptions, or services

### 📱 User Experience
- **Transaction History**: Search, filter, and export full payment logs
- **Email Notifications**: Real-time alerts for payments, invoices, and reminders
- **Mobile-Optimized**: Fully responsive for desktop and mobile browsers


## 🔹 Getting Started

The project is now under **private development**. For collaboration, licensing, or early access:

📩 **Contact:** **shan@projectsienna.xyz**

---

## 🔹 Why Sienna?

- **Solana Speed**: Near-instant, low-cost USDC transactions
- **Enterprise-Ready**: Scalable for freelancers, SMBs, and Web3-native businesses
- **DeFi Integration**: Earn yield while managing cash flow

## Technology Stack

- **Frontend**: React 19 with React Router for navigation
- **Styling**: Tailwind CSS for modern, responsive design
- **Blockchain**: Solana Web3.js and SPL Token for token transfers
- **Wallet**: Solana Wallet Adapter for wallet connectivity
- **Storage**: Context API with local persistence

### Prerequisites

- Node.js (v22.0.0 or later)
- npm (v10.0.0 or later) or yarn
- A Solana wallet (Phantom, Solflare)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ProjSienna/sienna.git
   cd sienna
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create your environment file:
   ```
   cp .env.example .env.development
   ```

4. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the navigation bar
2. Select your preferred Solana wallet
3. Approve the connection request in your wallet

### Managing Payees

1. Navigate to the "Pay" section
2. Add new payees with their wallet addresses and details
3. View and manage existing payees

### Sending Payments

#### Individual Payment:
1. Navigate to the "Pay" section
2. Select a payee or enter a new wallet address
3. Enter the amount and details
4. Confirm the transaction in your wallet

### Requesting Payments

1. Navigate to the "Pay Request" section
2. Fill in the payment details and recipient information
3. Send the request via the platform

## Development

### Project Structure

```
sienna/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and assets
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.js        # Navigation component
│   │   ├── PayeeForm.js     # Payee management form
│   │   ├── PaymentForm.js   # Payment creation form
│   │   ├── InvoiceForm.js   # Invoice creation component
│   │   ├── YieldOptions.js  # Yield generation options
│   │   ├── EmailSettings.js # Email configuration component
│   │   └── ...
│   ├── contexts/            # React context providers
│   │   ├── WalletContext.js # Wallet connection state
│   │   ├── PayeesContext.js # Payee management state
│   │   ├── InvoicesContext.js # Invoice management state
│   │   ├── YieldContext.js  # Yield generation state
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── HomePage.js      # Dashboard page
│   │   ├── GrowthPage.js    # Growth analytics
│   │   ├── InvoicesPage.js  # Invoice management
│   │   ├── YieldPage.js     # Yield generation
│   │   ├── EmailsPage.js    # Email template management
│   │   └── ...
│   ├── templates/           # Email templates
│   │   ├── PaymentRequestEmail.html # Payment request template
│   │   ├── InvoiceEmail.html # Invoice email template
│   │   ├── ReminderEmail.html # Payment reminder template
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── solana.js        # Solana blockchain utilities
│   │   ├── api.js           # API service functions
│   │   ├── invoice.js       # Invoice generation utilities
│   │   ├── yield.js         # Yield calculation utilities
│   │   ├── email.js         # Email sending utilities
│   │   └── ...
│   ├── App.js               # Main App component
│   └── index.js             # Entry point
├── .env.example             # Example environment variables
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── config-overrides.js      # Webpack configuration overrides
```

## Configuration

The application uses environment variables for configuration:

- Create a `.env.development` file for local development
- Use `.env.production` for production deployment
- See `.env.example` for required variables

## Important Notes

- This application is configured to use the Solana mainnet by default. For development purposes, you may want to switch to devnet or testnet.
- USDC transfers require actual USDC tokens on the corresponding Solana network.
- The application requires Node.js v22+ for optimal performance.
- Yield generation features integrate with third-party DeFi protocols. Always review the current yield rates and risks before depositing funds.
- Email functionality requires proper SMTP configuration in your environment variables.
- Invoice and payment gateway features can be customized with your business branding through the settings panel.
- For high-volume API usage, consider implementing rate limiting and additional security measures.

## Troubleshooting

If you encounter issues with dependencies:
1. Run `npm run fix-modules` to clean up problematic node modules
2. Run `npm run patch` to apply necessary patches
3. These scripts run automatically before `npm start` and `npm build`

## License

This project is proprietary software. Unauthorized use, modification, or distribution is prohibited.

## Contact

- Email: contact@projectsienna.xyz
- Twitter: [@project_sienna](https://x.com/project_sienna)
