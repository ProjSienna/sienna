/**
 * Application configuration
 * Centralizes environment-specific settings and feature flags
 */

// Environment
export const ENV = process.env.REACT_APP_ENV || 'development';
export const IS_PROD = ENV === 'production';
export const IS_DEV = ENV === 'development';

// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Feature flags
export const FEATURES = {
  WALLET_VERIFICATION: true,      // Enable wallet address verification
  TRANSACTION_SYNC: true,         // Enable transaction syncing with backend
  BALANCE_CHECKS: true,           // Enable wallet balance checks
  RECEIPT_GENERATION: true,       // Enable receipt generation
  NOTIFICATIONS: true,            // Enable notification system
};

// Solana configuration
export const SOLANA_CONFIG = {
  USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC token mint address
  COMMITMENT_LEVEL: 'confirmed',
};

// Maximum batch sizes
export const MAX_BATCH_SIZE = 5; // Maximum number of transactions per batch

// Default values
export const DEFAULTS = {
  TRANSACTION_EXPIRE_DAYS: 90,   // How long to keep transactions in local storage (days)
};

export default {
  ENV,
  IS_PROD,
  IS_DEV,
  API_URL,
  FEATURES,
  SOLANA_CONFIG,
  MAX_BATCH_SIZE,
  DEFAULTS,
}; 