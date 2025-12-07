import { CLOCK_ID, getSealConfig, VAULT_PACKAGE_ID } from "@/config/vault-config";
import {
    useCurrentAccount,
    useSignPersonalMessage,
    useSuiClient
} from "@mysten/dapp-kit";
import { NoAccessError, SealClient, SessionKey as SealSessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { WalrusClient } from "@mysten/walrus";
import { useMutation } from "@tanstack/react-query";
import { Buffer } from "buffer";

const sealConfig = getSealConfig();

export const useDecryptVaultFile = () => {
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

    const walrusClient = new WalrusClient({
        network: "testnet",
        suiClient: suiClient,
    });

    console.log(sealConfig.keyServers.map((id) => ({
        objectId: id,
        weight: 1,
    })))

    const sealClient = new SealClient({
        suiClient,
        serverConfigs: sealConfig.keyServers.map((id) => ({
            objectId: id,
            weight: 1,
        })),
        verifyKeyServers: true,
    });

    const mutation = useMutation({
        mutationFn: async ({
            quiltId,
            identifier,
            vault_id,
            seal_id
        }: {
            quiltId: string;
            identifier: string;
            vault_id: string;
            seal_id: string;
        }) => {
            try {
                console.log("=== Starting Decryption Process ===");
                console.log("Parameters:", { quiltId, identifier, vault_id, seal_id });

                // Step 1: Fetch encrypted blob from Walrus
                console.log("\n[1/6] Fetching blob from Walrus...");
                try {
                    const blob = await walrusClient.getBlob({ blobId: quiltId });
                    console.log("✓ Blob fetched:", blob);

                    const [file] = await blob.files({ identifiers: [identifier] });
                    console.log("✓ File found:", file);

                    const bytes = await file.bytes();
                    const fileBuffer = Buffer.from(bytes);
                    console.log("✓ File buffer created, size:", fileBuffer.length, "bytes");
                } catch (error) {
                    console.error("✗ Error fetching blob:", error);
                    throw new Error(`Failed to fetch blob: ${error instanceof Error ? error.message : String(error)}`);
                }

                const blob = await walrusClient.getBlob({ blobId: quiltId });
                const [file] = await blob.files({ identifiers: [identifier] });
                const bytes = await file.bytes();
                const fileBuffer = Buffer.from(bytes);

                // Step 2: Create session key
                console.log("\n[2/6] Creating session key...");
                let sessionKey;
                try {
                    sessionKey = await SealSessionKey.create({
                        address: currentAccount?.address!,
                        packageId: VAULT_PACKAGE_ID,
                        ttlMin: 30,
                        suiClient: suiClient,
                    });
                    console.log("✓ Session key created");
                } catch (error) {
                    console.error("✗ Error creating session key:", error);
                    throw new Error(`Failed to create session key: ${error instanceof Error ? error.message : String(error)}`);
                }

                // Step 3: Get and sign personal message
                console.log("\n[3/6] Signing personal message...");
                let signatureResult;
                try {
                    const personalMessage = sessionKey.getPersonalMessage();
                    console.log("Personal message:", personalMessage);

                    signatureResult = await signPersonalMessage({
                        message: personalMessage,
                    });
                    console.log("✓ Personal message signed:", signatureResult);

                    await sessionKey.setPersonalMessageSignature(signatureResult.signature);
                    console.log("✓ Signature set on session key");
                } catch (error) {
                    console.error("✗ Error signing message:", error);
                    throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
                }

                // Step 4: Build transaction for Seal approval
                console.log("\n[4/6] Building transaction...");
                let txBytes;
                try {
                    const tx = new Transaction();

                    // Convert seal_id to bytes
                    const sealIdBytes = Array.from(new TextEncoder().encode(seal_id));
                    console.log("Seal ID bytes:", sealIdBytes);
                    console.log("Vault ID:", vault_id);
                    console.log("Clock ID:", CLOCK_ID);

                    tx.moveCall({
                        target: `${VAULT_PACKAGE_ID}::vault_access::seal_approve`,
                        arguments: [
                            tx.pure.vector('u8', sealIdBytes),
                            tx.object(vault_id),
                            tx.object(CLOCK_ID),
                        ],
                    });

                    txBytes = await tx.build({
                        client: suiClient,
                        onlyTransactionKind: true,
                    });
                    console.log("✓ Transaction bytes built, length:", txBytes.length);
                } catch (error) {
                    console.error("✗ Error building transaction:", error);
                    throw new Error(`Failed to build transaction: ${error instanceof Error ? error.message : String(error)}`);
                }

                try {
                    await sealClient.fetchKeys({ ids: [seal_id], txBytes, sessionKey, threshold: 1 });
                } catch (err) {
                    console.error(err);
                    if (err instanceof NoAccessError) {
                        throw new Error('No access to decryption keys');
                    }
                    throw new Error('Unable to fetch decryption keys');
                }


                // Step 5: Decrypt the file
                console.log("\n[5/6] Decrypting file...");
                let decryptedObject;
                try {
                    console.log("Calling sealClient.decrypt with:");
                    console.log("- Data length:", fileBuffer.length);
                    console.log("- Session key valid:", !!sessionKey);
                    console.log("- TX bytes length:", txBytes.length);

                    decryptedObject = await sealClient.decrypt({
                        data: fileBuffer,
                        sessionKey: sessionKey,
                        txBytes: txBytes,
                    });
                    console.log("✓ File decrypted successfully, size:", decryptedObject.length);
                } catch (error) {
                    console.error(error)
                    console.error("✗ Error during decryption:", error);
                    console.error("Error details:", {
                        name: error instanceof Error ? error.name : 'Unknown',
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : 'No stack trace',
                    });
                    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
                }

                // Step 6: Download the file
                console.log("\n[6/6] Preparing file download...");
                try {
                    const fileData = Uint8Array.from(decryptedObject);
                    const downloadBlob = new Blob([fileData], { type: 'application/octet-stream' });
                    const url = window.URL.createObjectURL(downloadBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = identifier;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    console.log(`✓ File "${identifier}" downloaded successfully`);
                } catch (error) {
                    console.error("✗ Error downloading file:", error);
                    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
                }

                console.log("\n=== Decryption Process Complete ===");
                return {
                    success: true,
                    fileName: identifier,
                    fileSize: decryptedObject.length,
                };

            } catch (error) {
                // This is the top-level catch that will log everything
                console.error("\n=== DECRYPTION FAILED ===");
                console.error("Error:", error);
                console.error("Error type:", typeof error);
                console.error("Error constructor:", error?.constructor?.name);

                if (error instanceof Error) {
                    console.error("Error name:", error.name);
                    console.error("Error message:", error.message);
                    console.error("Error stack:", error.stack);
                }

                // Re-throw with proper message
                throw error instanceof Error
                    ? error
                    : new Error(`Decryption failed: ${String(error)}`);
            }
        },
        onSuccess: (data) => {
            console.log("✓✓✓ Mutation succeeded:", data);
        },
        onError: (error) => {
            console.error("✗✗✗ Mutation failed:");
            console.error("Error object:", error);
            console.error("Error message:", error instanceof Error ? error.message : String(error));
            console.error("Full error:", JSON.stringify(error, null, 2));
        },
    });

    return {
        decrypt: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};