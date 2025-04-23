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

// USDC token mint address (devnet)
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

// // Send USDC tokens
// export async function sendUSDC({
//     connection,
//     fromWallet,
//     toWallet,
//     amount,
// }) {
//     try {
//         const fromWalletPubkey = new PublicKey(fromWallet);
//         const toWalletPubkey = new PublicKey(toWallet);

//         // Get the source token account
//         const fromTokenAccount = await findAssociatedTokenAddress(
//             fromWalletPubkey,
//             USDC_MINT
//         );

//         // Get the destination token account
//         const toTokenAccount = await findAssociatedTokenAddress(
//             toWalletPubkey,
//             USDC_MINT
//         );

//         // Create transfer instruction
//         const transferInstruction = Token.createTransferInstruction(
//             TOKEN_PROGRAM_ID,
//             fromTokenAccount,
//             toTokenAccount,
//             fromWalletPubkey,
//             [],
//             amount * (10 ** 6) // USDC has 6 decimals
//         );

//         // Get recent blockhash
//         const { blockhash } = await connection.getLatestBlockhash();

//         // Create transaction
//         const transaction = new Transaction({
//             recentBlockhash: blockhash,
//             feePayer: fromWalletPubkey,
//         }).add(transferInstruction);

//         // Return the transaction for signing
//         return transaction;
//     } catch (error) {
//         console.error('Error creating transaction:', error);
//         throw error;
//     }
// }

export async function sendUSDC({
    connection,
    fromWallet,
    toPublicKey,
    amount, // in USDC base units (so 6 decimals: 1 USDC = 1_000_000)
  }) {
    const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  
    // Get ATA (Associated Token Address) for both sender and recipient
    const fromTokenAccount = await getAssociatedTokenAddress(USDC_MINT, fromWallet.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, toPublicKey);
  
    // Check if sender has enough USDC
    const fromAccountInfo = await getAccount(connection, fromTokenAccount);
    if (fromAccountInfo.amount < BigInt(amount)) {
      throw new Error("Insufficient USDC balance");
    }
  
    // Build the transfer instruction
    const transferIx = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromWallet.publicKey,
      BigInt(amount), // 6 decimals for USDC
      [],
      TOKEN_PROGRAM_ID
    );
  
    // Send transaction
    const tx = new Transaction().add(transferIx);
    const signature = await sendAndConfirmTransaction(connection, tx, [fromWallet]);
    console.log("✅ USDC Transfer complete:", signature);
  
    return signature;
  }

// Format wallet address for display
export function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 