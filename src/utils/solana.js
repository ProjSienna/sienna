import {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    getAccount,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// USDC token mint address (mainnet)
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// USDC token account
export async function findAssociatedTokenAddress(
    walletAddress,
    tokenMintAddress
) {
    return (
        await PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
            ],
            new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        )
    )[0];
}

export async function sendUSDC({
    connection,
    fromWallet,
    toWallet,
    amount,
}) {
    try {
        // Convert string addresses to PublicKey objects if needed
        const fromPubkey = typeof fromWallet === 'string' 
            ? new PublicKey(fromWallet) 
            : fromWallet;
        
        const toPubkey = typeof toWallet === 'string' 
            ? new PublicKey(toWallet) 
            : toWallet;

        // Get the associated token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(
            USDC_MINT,  // mint
            fromPubkey  // owner
        );

        const toTokenAccount = await getAssociatedTokenAddress(
            USDC_MINT,  // mint
            toPubkey    // owner
        );

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            fromTokenAccount,  // source
            toTokenAccount,    // destination
            fromPubkey,        // owner
            BigInt(Math.round(amount * 1000000)),  // amount * 10^6 (USDC has 6 decimals)
            [],                // multisig signers
            TOKEN_PROGRAM_ID   // program ID
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();

        // Create transaction
        const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: fromPubkey,
        }).add(transferInstruction);

        // Return the transaction for signing
        return transaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

// Format wallet address for display
export function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 