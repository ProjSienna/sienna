import {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    Keypair,
    TransactionMessage,
    VersionedTransaction,
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

/**
 * Send multiple USDC payments in a single transaction
 * This is optimized for payroll where one sender pays multiple recipients
 *
 * @param {Object} params - The transaction parameters
 * @param {Connection} params.connection - Solana connection object
 * @param {String|PublicKey} params.fromWallet - Sender's wallet (address string or PublicKey)
 * @param {Array} params.recipients - Array of recipient objects: [{walletAddress, amount}]
 * @param {Number} params.maxInstructions - Max instructions per transaction (default: 5)
 * @returns {Array} Array of transactions ready to be signed and sent
 */
export async function sendBatchUSDC({
    connection,
    fromWallet,
    recipients,
    maxInstructions = 5, // Limit instructions per transaction for reliability
}) {
    try {
        // Convert from string address to PublicKey if needed
        const fromPubkey = typeof fromWallet === 'string' 
            ? new PublicKey(fromWallet) 
            : (fromWallet.publicKey || fromWallet);
        
        // Get the sender's token account
        const fromTokenAccount = await getAssociatedTokenAddress(
            USDC_MINT,
            fromPubkey
        );
        
        // Get recent blockhash for all transactions
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        
        // Create batches of instructions
        const allInstructions = [];
        
        // Process each recipient
        for (const recipient of recipients) {
            // Skip invalid entries
            if (!recipient.walletAddress || !recipient.amount || recipient.amount <= 0) {
                console.warn('Skipping invalid recipient:', recipient);
                continue;
            }
            
            // Convert to PublicKey
            const toPubkey = typeof recipient.walletAddress === 'string'
                ? new PublicKey(recipient.walletAddress)
                : recipient.walletAddress;
            
            // Get the recipient's token account
            const toTokenAccount = await getAssociatedTokenAddress(
                USDC_MINT,
                toPubkey
            );
            
            // Create transfer instruction
            const transferInstruction = createTransferInstruction(
                fromTokenAccount,  // source
                toTokenAccount,    // destination
                fromPubkey,        // owner
                BigInt(Math.round(recipient.amount * 1000000)),  // amount * 10^6 (USDC has 6 decimals)
                [],                // multisig signers
                TOKEN_PROGRAM_ID   // program ID
            );
            
            allInstructions.push({
                instruction: transferInstruction,
                recipient: recipient
            });
        }
        
        // Split instructions into multiple transactions if needed
        const batches = [];
        for (let i = 0; i < allInstructions.length; i += maxInstructions) {
            batches.push(allInstructions.slice(i, i + maxInstructions));
        }
        
        // Create transactions from batches
        const transactions = batches.map(batch => {
            const tx = new Transaction({
                recentBlockhash: blockhash,
                feePayer: fromPubkey,
                lastValidBlockHeight,
            });
            
            // Add all instructions for this batch
            batch.forEach(({ instruction }) => {
                tx.add(instruction);
            });
            
            // Include the recipient info for each transaction to track them later
            tx.recipients = batch.map(item => item.recipient);
            
            return tx;
        });
        
        return transactions;
        
    } catch (error) {
        console.error('Error creating batch USDC transfers:', error);
        throw error;
    }
}

// Format wallet address for display
export function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 