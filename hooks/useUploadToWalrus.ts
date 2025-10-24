import { useMutation } from "@tanstack/react-query";
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { SealClient } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";

// --- 1️⃣ UPLOAD TO WALRUS ---
export const useUploadToWalrus = () => {
    const currentAccount = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const walrusClient = new WalrusClient({
        network: "testnet",
        suiClient: client as SuiClient,
    });

    return useMutation<string[], Error, { files: File[], vaultName: string }>({
        mutationFn: async ({ files, vaultName }) => {
            if (!currentAccount) throw new Error("Wallet not connected");
            if (!client) throw new Error("Client not available");

            // Convert each file to a WalrusFile
            const walrusFiles: WalrusFile[] = await Promise.all(
                files.map(async (file, index) => {
                    const contents = new Uint8Array(await file.arrayBuffer());
                    const identifier = `${vaultName}-${index}`;
                    return WalrusFile.from({ contents, identifier });
                })
            );

            const flow = walrusClient.writeFilesFlow({
                files: walrusFiles,
            });

            // Encode and register the file
            await flow.encode();
            const registerTx = flow.register({
                owner: currentAccount.address,
                epochs: 1,
                deletable: true,
            });

            const { digest } = await signAndExecuteTransaction({
                transaction: registerTx as Transaction,
            });
            console.log("📦 Registered blob with transaction:", digest);

            // Upload to Walrus
            await flow.upload({ digest });
            console.log("✅ Uploaded to Walrus nodes");

            // Certify
            const certifyTx = flow.certify();
            await signAndExecuteTransaction({ transaction: certifyTx });
            console.log("🔏 Certified blob");

            const fileList = await flow.listFiles();
            const blobIds = fileList.map((file) => file.blobId);

            console.log("🆔 Walrus Blob IDs:", blobIds);
            return blobIds;
        },
        onError: (error) => {
            console.error("❌ Upload failed:", error.message);
        },
    });
};

// --- 2️⃣ SEAL THE BLOB (AFTER WALRUS UPLOAD) ---
export const useSealBlob = () => {
    const client = useSuiClient();

    // Replace these with your actual on-chain server objects from Seal deployment
    const serverObjectIds = [
        '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
        '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
        '0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2',
    ];

    const sealClient = new SealClient({
        suiClient: client,
        serverConfigs: serverObjectIds.map((id) => ({
            objectId: id,
            weight: 0.1,
        })),
        verifyKeyServers: false,
    });

    return useMutation<string, Error, { blobId: string, unlockTime: number }>({
        mutationFn: async ({ blobId, unlockTime }) => {
            console.log("🪄 Sealing blob:", blobId);

            // The "id" here is a unique label for the seal policy
            const sealId = crypto.randomUUID(); // or any unique string

            // Encrypt a reference or metadata about the blob
            const data = new TextEncoder().encode(JSON.stringify({ blobId, unlockTime }));

            // Encrypt the metadata/pointer
            const encryptedResult = await sealClient.encrypt({
                id: sealId,
                data,
                threshold: 1,
                packageId: "0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682",
            });

            console.log("🔐 Encrypted Seal Result:", encryptedResult);

            // You can now save or display this `sealId`
            return sealId;
        },
        onError: (error) => {
            console.error("❌ Seal encryption failed:", error.message);
        },
    });
};
