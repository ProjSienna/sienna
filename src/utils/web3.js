import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONFIG } from '../config';

/**
 * Fetch SOL and USDC balances for a wallet address
 * 
 * @param {Object} connection - Solana connection object from wallet adapter
 * @param {String} walletAddress - Solana wallet address
 * @returns {Promise<Object>} Object containing SOL and USDC balances
 */
export const fetchWalletBalances = async (connection, walletAddress) => {
  try {
    if (!connection || !walletAddress) {
      throw new Error('Connection and wallet address are required');
    }
    
    const pubkey = new PublicKey(walletAddress);
    
    // Fetch SOL balance
    const sol = await connection.getBalance(pubkey);
    const solBalance = sol / 1000000000; // Convert lamports to SOL
    
    // USDC token mint address
    const USDC_MINT = new PublicKey(SOLANA_CONFIG.USDC_MINT);
    
    // Fetch USDC token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      pubkey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    // Find USDC account
    const usdcAccount = tokenAccounts.value.find(
      account => account.account.data.parsed.info.mint === USDC_MINT.toString()
    );
    
    let usdcBalance = 0;
    if (usdcAccount) {
      usdcBalance = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
    }
    
    return {
      sol: solBalance,
      usdc: usdcBalance,
      success: true
    };
  } catch (err) {
    console.error('Error fetching wallet balances:', err);
    return {
      sol: 0,
      usdc: 0,
      success: false,
      error: err.message
    };
  }
}; 