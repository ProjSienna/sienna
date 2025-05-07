import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { API_URL } from '../config';

// No more UI imports needed

const WalletContext = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.MainnetBeta;

  // TODO: Move this RPC endpoint to a backend proxy for production
  // Using direct RPC endpoint for now - to be replaced with backend proxy
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=e3e38817-187e-4a3b-b5cd-b40a0429c0c6";
  // DEVNET endpoint
  // const endpoint = "https://devnet.helius-rpc.com/?api-key=e3e38817-187e-4a3b-b5cd-b40a0429c0c6";
  
  // Only instantiate the wallets you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContext; 