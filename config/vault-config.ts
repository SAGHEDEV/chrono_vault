// import { getAllowlistedKeyServers } from "@mysten/seal";
/**
 * ChronoVault Configuration
 * 
 * This file contains all the configuration needed for ChronoVault
 * Update these values based on your deployment
 */

// ==================== Network Configuration ====================

export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// ==================== Contract Configuration ====================

/**
 * Your deployed Vault package ID
 * Deploy your contract and update this value
 */
export const VAULT_PACKAGE_ID = process.env.NEXT_PUBLIC_CHRONOVAULT_PACKAGE_ID || '0x...';

/**
 * Your deployed Vault Registry shared object ID
 * This is created during contract deployment
 */
export const VAULT_REGISTRY_ID = process.env.NEXT_PUBLIC_VAULT_REGISTRY || '0x...';

/**
 * Sui Clock object ID (constant across all networks)
 */
export const CLOCK_ID = '0x6';

// ==================== Seal Configuration ====================

/**
 * Seal Key Server configurations
 * These are the identity-based encryption key servers
 */
// const keyServers = getAllowlistedKeyServers(network);
export const SEAL_CONFIG = {
    testnet: {
        keyServers: [
            '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
            '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
        ],
    },
    mainnet: {
        keyServers: [
            // TODO: Add mainnet key server IDs
            // Get these from: https://seal-docs.wal.app/Pricing/#verified-key-servers
        ],
    },
};

/**
 * Get the appropriate Seal configuration for the current network
 */
export function getSealConfig() {
    return SEAL_CONFIG[NETWORK];
}

// ==================== Walrus Configuration ====================

/**
 * Walrus storage configuration
 */
export const WALRUS_CONFIG = {
    testnet: {
        // Number of epochs to store files
        // 1 epoch ≈ 24 hours on testnet
        storageEpochs: 10,

        // Whether files can be deleted
        deletable: false,

        // Upload relay (optional, improves performance)
        uploadRelay: process.env.NEXT_PUBLIC_WALRUS_UPLOAD_RELAY || undefined,
    },
    mainnet: {
        storageEpochs: 100, // Longer storage on mainnet
        deletable: false,
        uploadRelay: process.env.NEXT_PUBLIC_WALRUS_UPLOAD_RELAY || undefined,
    },
} as const;

/**
 * Get the appropriate Walrus configuration for the current network
 */
export function getWalrusConfig() {
    return WALRUS_CONFIG[NETWORK];
}

// ==================== File Upload Limits ====================

/**
 * Maximum file size in bytes (10 MB default)
 */
export const MAX_FILE_SIZE = parseInt(
    process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'
);

/**
 * Maximum number of files per vault
 */
export const MAX_FILES_PER_VAULT = parseInt(
    process.env.NEXT_PUBLIC_MAX_FILES_PER_VAULT || '50'
);

/**
 * Allowed file types (MIME types)
 * Empty array means all types allowed
 */
export const ALLOWED_FILE_TYPES: string[] = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',

    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

    // Videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',

    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',

    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',

    // Code
    'application/json',
    'application/javascript',
    'text/html',
    'text/css',
];

// ==================== UI Configuration ====================

/**
 * Toast notification duration in milliseconds
 */
export const TOAST_DURATION = 5000;

/**
 * Progress update interval in milliseconds
 */
export const PROGRESS_UPDATE_INTERVAL = 500;

// ==================== Sui NS Configuration ====================

/**
 * Sui Name Service configuration
 */
export const SUI_NS_CONFIG = {
    testnet: {
        // SuiNS package ID on testnet
        packageId: '0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0',
    },
    mainnet: {
        // SuiNS package ID on mainnet
        packageId: '0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0',
    },
} as const;

/**
 * Get the appropriate Sui NS configuration for the current network
 */
export function getSuiNSConfig() {
    return SUI_NS_CONFIG[NETWORK];
}

// ==================== Feature Flags ====================

/**
 * Feature flags for enabling/disabling features
 */
export const FEATURES = {
    // Enable Sui NS name resolution
    enableSuiNS: process.env.NEXT_PUBLIC_ENABLE_SUI_NS !== 'false',

    // Enable email notifications
    enableEmailNotifications: process.env.NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS === 'true',

    // Enable analytics
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

    // Enable debug mode
    debugMode: process.env.NODE_ENV === 'development',
} as const;

// ==================== Validation Functions ====================

/**
 * Validate if a file meets the upload requirements
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)} MB`,
        };
    }

    if (ALLOWED_FILE_TYPES.length > 0 && !ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `File type "${file.type}" is not allowed`,
        };
    }

    return { valid: true };
}

/**
 * Validate if the number of files is within limits
 */
export function validateFileCount(count: number): { valid: boolean; error?: string } {
    if (count > MAX_FILES_PER_VAULT) {
        return {
            valid: false,
            error: `Cannot upload more than ${MAX_FILES_PER_VAULT} files per vault`,
        };
    }

    if (count === 0) {
        return {
            valid: false,
            error: 'At least one file must be uploaded',
        };
    }

    return { valid: true };
}

/**
 * Validate Sui address format
 */
export function isValidSuiAddress(address: string): boolean {
    // Sui addresses start with 0x and are 66 characters long (including 0x)
    return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Validate Sui NS name format
 */
export function isValidSuiNSName(name: string): boolean {
    // SuiNS names start with @ and contain only alphanumeric and hyphens
    return /^@[a-zA-Z0-9-]+\.?sui?$/.test(name);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ==================== Export All ====================

export default {
    NETWORK,
    VAULT_PACKAGE_ID,
    VAULT_REGISTRY_ID,
    CLOCK_ID,
    MAX_FILE_SIZE,
    MAX_FILES_PER_VAULT,
    ALLOWED_FILE_TYPES,
    TOAST_DURATION,
    PROGRESS_UPDATE_INTERVAL,
    FEATURES,
    getSealConfig,
    getWalrusConfig,
    getSuiNSConfig,
    validateFile,
    validateFileCount,
    isValidSuiAddress,
    isValidSuiNSName,
    formatFileSize,
    formatTimestamp,
};