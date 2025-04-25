import {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    Keypair,
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
    isKeypair = false,  // Flag to indicate if fromWallet is a Keypair
}) {
    try {
        // Convert string addresses to PublicKey objects if needed
        const fromPubkey = typeof fromWallet === 'string' 
            ? new PublicKey(fromWallet) 
            : (fromWallet.publicKey || fromWallet);
        
        const toPubkey = typeof toWallet === 'string' 
            ? new PublicKey(toWallet) 
            : (toWallet.publicKey || toWallet);

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
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

        // Create transaction
        const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: fromPubkey,
            lastValidBlockHeight,
        }).add(transferInstruction);

        // If we have a full keypair (with private key), we can send and confirm directly
        if (isKeypair && fromWallet.secretKey) {
            console.log("Using direct sendAndConfirmTransaction method...");
            const signature = await sendAndConfirmTransaction(
                connection, 
                transaction, 
                [fromWallet],  // fromWallet needs to be a Keypair
                {
                    commitment: 'confirmed',
                    maxRetries: 5
                }
            );
            console.log("✅ USDC transfer complete. Signature:", signature);
            return {
                success: true,
                signature,
                transaction: null  // No need to return the transaction since it's already sent
            };
        }

        // Otherwise, just return the transaction for the wallet adapter to sign and send
        return transaction;
    } catch (error) {
        console.error('Error sending USDC:', error);
        throw error;
    }
}

// Format wallet address for display
export function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 