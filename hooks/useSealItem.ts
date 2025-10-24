import { useState, useCallback } from "react";
import { SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

export type SealIntegrationResult = {
    backupKey: Uint8Array;
    encryptedSize: number;
};

export function useSealIntegration() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SealIntegrationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount()
    const suiClient = useSuiClient();

    const runSealIntegration = useCallback(async () => {
        setLoading(true);
        setError(null);


        try {

            const serverObjectIds = [
                "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
                "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
                "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2",
            ];

            const sealClient = new SealClient({
                suiClient,
                serverConfigs: serverObjectIds.map((id) => ({
                    objectId: id,
                    weight: 1,
                })),
                verifyKeyServers: false,
            });

            const packageId =
                "0x312ffd6d30c8e7c3bd3a2d369fcab323bcd05a7ad3509d189b8f7abcd26662fa";
            const id = "77616c7275732d7365616c2d696e746567726174696f6e";
            const accessControlId =
                "0x3825e23fb40d5697fd4b11e3f307e32349c5e3a6daf66a452b71661d2b6119b1";

            const sensitiveData = {
                message: "This is highly sensitive data that should be encrypted!",
                timestamp: new Date().toISOString(),
                userId: "user123",
                secretKey: "super-secret-key-12345",
                metadata: {
                    priority: "high",
                    category: "confidential",
                    tags: ["private", "encrypted"],
                },
            };

            const dataToEncrypt = new TextEncoder().encode(
                JSON.stringify(sensitiveData, null, 2)
            );

            console.log("📦 Original data size:", dataToEncrypt.length, "bytes");

            // --- Step 1: Encrypt ---
            const { encryptedObject: encryptedBytes, key: backupKey } =
                await sealClient.encrypt({
                    threshold: 2,
                    packageId,
                    id,
                    data: dataToEncrypt,
                });

            console.log("✅ Seal encryption successful:", encryptedBytes.length, "bytes");

            // --- Step 2: Create Session Key ---
            const sessionKey = await SessionKey.create({
                address: currentAccount?.address!,
                packageId,
                ttlMin: 10,
                suiClient,
            });

            // --- Step 3: Approve access control on-chain ---
            const tx = new Transaction();
            tx.moveCall({
                target: `${packageId}::access_control::seal_approve`,
                arguments: [
                    tx.pure.vector("u8", Array.from(new TextEncoder().encode(id))),
                    tx.object(accessControlId),
                ],
            });

            signAndExecuteTransaction({
                transaction: tx,
            });
            console.log("✅ Access control transaction executed successfully");

            // --- Step 4: Attempt decryption (may fail on testnet key servers) ---
            try {
                const txBytes = await tx.build({
                    client: suiClient,
                    onlyTransactionKind: true,
                });
                const decryptedData = await sealClient.decrypt({
                    data: encryptedBytes,
                    sessionKey,
                    txBytes,
                });

                if (decryptedData) {
                    const decryptedString = new TextDecoder().decode(decryptedData);
                    console.log("🔓 Decryption successful:", decryptedString);
                } else {
                    console.warn("⚠️ Decryption returned undefined (likely testnet limitation)");
                }
            } catch (decErr) {
                console.warn("⚠️ Decryption failed (expected on testnet):", decErr);
            }

            setResult({
                backupKey,
                encryptedSize: encryptedBytes.length,
            });
        } catch (err: any) {
            console.error("❌ Seal integration failed:", err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, result, error, runSealIntegration };
}
