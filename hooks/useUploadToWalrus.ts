import { useMutation } from "@tanstack/react-query";
import { WalrusClient, WalrusFile } from "@mysten/walrus";
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";

export const useUploadToWalrus = () => {
    const currentAccount = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const walrusClient = new WalrusClient({
        network: "testnet",
        suiClient: client,
    });
    return useMutation<string[], Error, Blob[]>({
        mutationFn: async (files: Blob[]) => {
            if (!currentAccount) {
                throw new Error("Wallet not connected");
            }
            if (!client) {
                throw new Error("Client not available");
            }

            const walrusFiles: WalrusFile[] = await Promise.all(
                files.map(async (file: Blob) => {
                    const contents = new Uint8Array(await file.arrayBuffer());
                    return WalrusFile.from({ contents, identifier: `Test ${Math.random()}` });
                })
            );
            console.log(walrusFiles)

            const flow = walrusClient.writeFilesFlow({
                files: walrusFiles,
            });
            console.log("Flow Accessed.");

            await flow.encode();

            const registerTx = flow.register({
                owner: currentAccount.address,
                epochs: 1,
                deletable: true,
            });
            const { digest } = await signAndExecuteTransaction({
                transaction: registerTx,
            });
            console.log("Registered blob with transaction.");

            await flow.upload({ digest });
            console.log("Uploaded data to Walrus storage nodes.");

            const certifyTx = flow.certify();
            await signAndExecuteTransaction({
                transaction: certifyTx,
            });
            console.log("Certified blob with transaction.");

            const fileList = await flow.listFiles()
            console.log(fileList)
            const fileListIds = fileList.map((file) => file.blobId)
            return fileListIds
        },
        onError: (error: any) => {
            console.error(error.message || "Failed to upload file(s).");
        },
        onSuccess: (blobIds) => {
            console.log("✅ Walrus BlobIds:", blobIds);
        },
    });
};
