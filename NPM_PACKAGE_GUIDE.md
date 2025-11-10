# X402 Payment Widget - NPM Package Guide

## Overview
This guide explains how to package and publish the X402PaymentWidget as an npm library for easy integration by developers.

## Current Status
The widget is currently available as a standalone React component that developers need to copy into their projects. To make it easier to use, we should publish it as an npm package.

## Package Structure

### Recommended Package Name
- `@projectsienna/x402-payment-widget` or
- `sienna-x402-widget` or
- `x402-payment-widget`

### Files to Include
```
x402-payment-widget/
├── package.json
├── README.md
├── LICENSE
├── .npmignore
├── src/
│   └── X402PaymentWidget.js
├── dist/
│   ├── index.js (CommonJS)
│   └── index.esm.js (ES Module)
└── index.d.ts (TypeScript definitions - optional)
```

## Steps to Create NPM Package

### 1. Create a New Directory for the Package
```bash
mkdir x402-payment-widget
cd x402-payment-widget
```

### 2. Initialize Package
```bash
npm init -y
```

### 3. Update package.json
```json
{
  "name": "@projectsienna/x402-payment-widget",
  "version": "1.0.0",
  "description": "React component for X402 protocol payments on Solana",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "files": [
    "dist",
    "README.md"
  ],
  "keywords": [
    "react",
    "solana",
    "x402",
    "payment",
    "crypto",
    "usdc",
    "blockchain"
  ],
  "author": "Project Sienna",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/projectsienna/x402-payment-widget"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@solana/wallet-adapter-react": "^0.15.0",
    "@solana/web3.js": "^1.76.0",
    "@solana/spl-token": "^0.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.23.0",
    "rollup": "^4.0.0",
    "@rollup/plugin-babel": "^6.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-commonjs": "^25.0.0"
  },
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  }
}
```

### 4. Create rollup.config.js for Bundling
```javascript
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/X402PaymentWidget.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'default'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  external: [
    'react',
    'react-dom',
    '@solana/wallet-adapter-react',
    '@solana/web3.js',
    '@solana/spl-token'
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env', '@babel/preset-react']
    })
  ]
};
```

### 5. Create .npmignore
```
src/
node_modules/
.git/
.gitignore
rollup.config.js
```

### 6. Create README.md
```markdown
# X402 Payment Widget

A React component for accepting X402 protocol payments on Solana.

## Installation

\`\`\`bash
npm install @projectsienna/x402-payment-widget
\`\`\`

## Prerequisites

Your app must have Solana Wallet Adapter configured:

\`\`\`bash
npm install @solana/wallet-adapter-react @solana/web3.js @solana/spl-token
\`\`\`

## Usage

\`\`\`jsx
import X402PaymentWidget from '@projectsienna/x402-payment-widget';

function App() {
  const handleSuccess = (result) => {
    console.log('Payment successful!', result);
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <X402PaymentWidget
      endpoint="https://api.projectsienna.xyz/api/payment"
      network="devnet"
      amount={0.01}
      description="Premium content access"
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}
\`\`\`

## Props

- **endpoint** (string, required): Backend API URL that returns X402 payment requirements
- **network** (string): "devnet" or "mainnet" (default: "devnet")
- **amount** (number): Payment amount in USDC
- **description** (string): Payment description
- **onPaymentSuccess** (function): Callback when payment succeeds
- **onPaymentError** (function): Callback when payment fails

## License

MIT
```

### 7. Copy the Widget Component
Copy `X402PaymentWidget.js` to the `src/` directory of your package.

### 8. Build the Package
```bash
npm install
npm run build
```

### 9. Test Locally Before Publishing
```bash
# In the package directory
npm link

# In your test project
npm link @projectsienna/x402-payment-widget
```

### 10. Publish to NPM
```bash
# Login to npm (first time only)
npm login

# Publish the package
npm publish --access public
```

## Usage After Publishing

Once published, developers can install and use it like this:

```bash
npm install @projectsienna/x402-payment-widget
```

```jsx
import X402PaymentWidget from '@projectsienna/x402-payment-widget';

function MyApp() {
  return (
    <X402PaymentWidget
      endpoint="https://api.projectsienna.xyz/api/payment"
      network="mainnet"
      amount={5.00}
      description="Premium subscription"
      onPaymentSuccess={(result) => {
        console.log('Payment successful:', result);
      }}
      onPaymentError={(error) => {
        console.error('Payment error:', error);
      }}
    />
  );
}
```

## Maintenance

### Versioning
Follow semantic versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Publishing Updates
```bash
# Update version in package.json
npm version patch  # or minor, or major

# Publish
npm publish
```

## Alternative: GitHub Package Registry

You can also publish to GitHub Packages instead of npm:

1. Create `.npmrc` in package root:
```
@projectsienna:registry=https://npm.pkg.github.com
```

2. Update package.json name to include scope:
```json
"name": "@projectsienna/x402-payment-widget"
```

3. Publish:
```bash
npm publish
```

## TypeScript Support (Optional)

To add TypeScript definitions, create `index.d.ts`:

```typescript
import { FC } from 'react';

export interface X402PaymentWidgetProps {
  endpoint: string;
  network?: 'devnet' | 'mainnet';
  amount?: number;
  description?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: Error) => void;
}

declare const X402PaymentWidget: FC<X402PaymentWidgetProps>;

export default X402PaymentWidget;
```

Add to package.json:
```json
"types": "index.d.ts"
```
