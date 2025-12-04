import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSignPersonalMessage,
    useSignTransaction,
    useSuiClient
} from '@mysten/dapp-kit';
import { SealClient } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { walrus, WalrusClient } from '@mysten/walrus';
import { WalrusFile } from '@mysten/walrus';
import { bcs } from '@mysten/sui/bcs';
import {
    VAULT_PACKAGE_ID,
    VAULT_REGISTRY_ID,
    CLOCK_ID,
    getSealConfig,
    getWalrusConfig,
} from '@/config/vault-config';

// Types
interface CreateVaultParams {
    files: File[];
    vaultName: string;
    description: string;
    unlockTime?: number; // Unix timestamp in milliseconds
    authorizedAddresses?: string[];
}

interface EncryptedFileMetadata {
    fileName: string;
    fileSize: number;
    mimeType: string;
    encryptedSealId: string; // hex string
    walrusBlobId: string;
}

interface ProgressUpdate {
    currentFile: number;
    totalFiles: number;
    stage: 'encrypting' | 'uploading' | 'creating_vault' | 'complete';
    message: string;
    percentage: number;
}

interface CreateVaultResult {
    vaultId: string;
    encryptedFiles: EncryptedFileMetadata[];
    transactionDigest: string;
}

// Get configuration
const sealConfig = getSealConfig();
const ACCOUNT_ROOT_ID = process.env.NEXT_PUBLIC_ACCOUNT_ROOT_ID!;
// Helper function to convert Uint8Array to hex string
function uint8ArrayToHex(arr: Uint8Array): string {
    return Array.from(arr)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper function to convert File to Uint8Array
async function fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            resolve(new Uint8Array(arrayBuffer));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Helper to resolve Sui NS names to addresses
async function resolveSuiNSName(name: string, suiClient: any): Promise<string> {
    if (name.startsWith('@')) {
        // Remove @ and .sui if present
        const cleanName = name.replace('@', '').replace('.sui', '');

        try {
            // Query the Sui NS contract to resolve the name
            // This is a simplified version - you'll need to implement actual Sui NS resolution
            // For now, we'll just validate and return as-is
            // TODO: Implement proper Sui NS resolution
            console.warn('Sui NS resolution not yet implemented for:', cleanName);
            return name; // Return original for now
        } catch (error) {
            console.error('Error resolving Sui NS name:', error);
            throw new Error(`Failed to resolve Sui NS name: ${name}`);
        }
    }
    return name; // Already an address
}

export function useCreateVault() {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const walrusClient = new WalrusClient({
        network: "testnet",
        suiClient: suiClient,
    });
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showObjectChanges: true,
                },
            }),
    });
    const [progress, setProgress] = useState<ProgressUpdate | null>(null);

    const updateProgress = (update: Partial<ProgressUpdate>) => {
        setProgress(prev => {
            if (!prev) return null;
            return { ...prev, ...update };
        });
    };

    const mutation = useMutation<CreateVaultResult, Error, CreateVaultParams>({
        mutationFn: async ({
            files,
            vaultName,
            description,
            unlockTime,
            authorizedAddresses = [],
        }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            if (files.length === 0) {
                throw new Error('No files provided');
            }

            // Initialize Seal Client
            const sealClient = new SealClient({
                suiClient,
                serverConfigs: sealConfig.keyServers.map((id) => ({
                    objectId: id,
                    weight: 1,
                })),
                verifyKeyServers: true,
            });

            // Initialize progress
            setProgress({
                currentFile: 0,
                totalFiles: files.length,
                stage: 'encrypting',
                message: 'Starting encryption process...',
                percentage: 0,
            });

            const walrusFiles = []
            const encryptedFiles: EncryptedFileMetadata[] = [];
            const sealIds: Uint8Array[] = [];
            // const blobIds: Uint8Array[] = [];

            // Resolve Sui NS names to addresses
            const resolvedAddresses: string[] = [];
            for (const addr of authorizedAddresses) {
                const resolved = await resolveSuiNSName(addr, suiClient);
                resolvedAddresses.push(resolved);
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileProgress = ((i / files.length) * 80); // 80% for file processing

                updateProgress({
                    currentFile: i + 1,
                    totalFiles: files.length,
                    stage: 'encrypting',
                    message: `Encrypting ${file.name}...`,
                    percentage: fileProgress,
                });

                try {
                    const fileData = await fileToUint8Array(file);

                    const fileId = `${vaultName}:${file.name}:${Date.now()}`;
                    const fileIdBytes = new TextEncoder().encode(fileId);

                    const { encryptedObject, key: sealId } = await sealClient.encrypt({
                        threshold: 2,
                        packageId: VAULT_PACKAGE_ID,
                        id: uint8ArrayToHex(bcs.vector(bcs.u8()).serialize(fileIdBytes).toBytes()),
                        data: fileData,
                    });

                    console.log(`✅ Encrypted ${file.name}, Seal ID:`, uint8ArrayToHex(sealId));

                    sealIds.push(sealId);

                    // Create WalrusFile with encrypted data
                    const walrusFile = WalrusFile.from({
                        contents: encryptedObject,
                        identifier: file.name,
                        tags: {
                            'content-type': file.type || 'application/octet-stream',
                            'original-size': file.size.toString(),
                            'encrypted': 'true',
                            'vault-name': vaultName,
                        },
                    });

                    walrusFiles.push(walrusFile);

                } catch (error) {
                    console.error(`Error encrypting ${file.name}:`, error);
                    throw error;
                }
            }

            const flow = walrusClient.writeFilesFlow({
                files: walrusFiles,
            });

            // Encode and register the files
            await flow.encode();
            const registerTx = flow.register({
                owner: account.address,
                epochs: 10,
                deletable: true,
            });

            const { digest } = await signAndExecuteTransaction({
                transaction: registerTx as Transaction,
            });
            console.log("📦 Registered blobs with transaction:", digest);

            // Upload to Walrus
            await flow.upload({ digest });
            console.log("✅ Uploaded to Walrus nodes");

            // Certify
            const certifyTx = flow.certify();
            await signAndExecuteTransaction({ transaction: certifyTx });
            console.log("🔏 Certified blobs");

            const fileList = await flow.listFiles();
            const blobIds = fileList.map((file) => file.blobId);

            console.log("🆔 Walrus Blob IDs:", blobIds);

            // Step 4: Create vault on-chain
            updateProgress({
                currentFile: files.length,
                totalFiles: files.length,
                stage: 'creating_vault',
                message: 'Creating vault on blockchain...',
                percentage: 85,
            });

            const tx = new Transaction();

            // Prepare data for contract call
            const unlockTimeValue = unlockTime || 0; // 0 means no time lock

            const sealIdsForMove = sealIds.map(id => Array.from(id));
            const blobIdsForMove = blobIds.map(id => {
                if (typeof id === 'string') {
                    return Array.from(new TextEncoder().encode(id));
                }
                return Array.from(id);
            });
            const fileIdentifiersForMove = files.map(file =>
                Array.from(new TextEncoder().encode(file.name))
            );
            const fileSizeIdentifierForMove = files.map(file =>
                Array.from(new TextEncoder().encode(file.size.toString()))
            );



            tx.moveCall({
                target: `${VAULT_PACKAGE_ID}::vault_access::create_vault`,
                arguments: [
                    tx.object(ACCOUNT_ROOT_ID),
                    tx.pure.u64(unlockTimeValue),
                    tx.pure.vector('address', resolvedAddresses),
                    tx.pure.vector('vector<u8>', sealIdsForMove),
                    tx.pure.vector('vector<u8>', blobIdsForMove as number[][]),
                    tx.pure.vector('vector<u8>', fileIdentifiersForMove),
                    tx.pure.string(vaultName),
                    tx.pure.string(description),
                    tx.object(CLOCK_ID),
                ],
            });


            // Execute transaction
            updateProgress({
                message: 'Waiting for transaction confirmation...',
                percentage: 90,
            });

            const result = await signAndExecuteTransaction({
                transaction: tx,
            });

            console.log('✅ Vault created successfully:', result);

            // Extract vault ID from events
            let vaultId = '';
            if (result.events) {
                const vaultCreatedEvent = result.events.find(
                    (e) => e.type.includes('VaultCreated')
                );
                if (vaultCreatedEvent) {
                    const vaultEventObject = vaultCreatedEvent.parsedJson as unknown as { vault_id: string, owner: string };
                    vaultId = vaultEventObject.vault_id;
                }
            }

            if (!vaultId) {
                vaultId = result.digest;
            }

            updateProgress({
                stage: 'complete',
                message: 'Vault created successfully!',
                percentage: 100,
            });

            return {
                vaultId,
                encryptedFiles,
                transactionDigest: result.digest,
            };
        },
        onError: (error) => {
            console.error('❌ Error creating vault:', error);
            setProgress(null);
        },
        onSuccess: (data) => {
            console.log('✅ Vault created successfully with ID:', data.vaultId);
            console.log('📦 Files:', data.encryptedFiles.length);
            console.log('🔗 Transaction:', data.transactionDigest);
            // Reset progress after a brief delay
            setTimeout(() => setProgress(null), 3000);
        },
    });

    return {
        createVault: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        progress,
        reset: mutation.reset,
    };
}