import { CLOCK_ID, getSealConfig, VAULT_PACKAGE_ID } from "@/config/vault-config";
import { useCurrentAccount, useSignPersonalMessage, useSuiClient, useWallets } from "@mysten/dapp-kit";
import { SealClient, SessionKey as SealSessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { WalrusClient } from "@mysten/walrus";
import { useMutation } from "@tanstack/react-query";
import { Buffer } from "buffer";

const sealConfig = getSealConfig();

export const useDecryptVaultFile = () => {
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    const walrusClient = new WalrusClient({
        network: "testnet",
        suiClient: suiClient,
    });
    const sealClient = new SealClient({
        suiClient,
        serverConfigs: sealConfig.keyServers.map((id) => ({
            objectId: id,
            weight: 1,
        })),
        verifyKeyServers: true,
    });
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    const mutation = useMutation({
        mutationFn: async ({ quiltId, identifier, vault_id, seal_id }: { quiltId: string, identifier: string, vault_id: string, seal_id: string }) => {
            console.log(identifier)
            const blob = await walrusClient.getBlob({ blobId: quiltId });
            const [file] = await blob.files({ identifiers: [identifier] });
            const bytes = await file.bytes();
            const fileBuffer = Buffer.from(bytes);

            console.log("Buffer gotten!")

            const sessionKey = await SealSessionKey.create({
                address: currentAccount?.address!,
                packageId: VAULT_PACKAGE_ID,
                ttlMin: 30,
                suiClient: suiClient,
            });

            console.log("Session key generated!")

            const personalMessage = sessionKey.getPersonalMessage();
            console.log("Personal message gotten!")

            try {
                signPersonalMessage({
                    message: personalMessage,
                }, {
                    onSuccess: async (result) => {
                        console.log("Personal message signed!")
                        await sessionKey.setPersonalMessageSignature(result.signature);

                        console.log("Personal message signature set! Result is:", result)

                        const tx = new Transaction();
                        const vaultObject = tx.object(vault_id);
                        const clockObject = tx.object(CLOCK_ID);
                        const sealId = tx.pure.string(seal_id);

                        console.log("Parameters: ", vaultObject, clockObject, sealId)

                        console.log("Transaction built!")

                        tx.moveCall({
                            target: `${VAULT_PACKAGE_ID}::vault_access::seal_approve`,
                            arguments: [
                                sealId,
                                vaultObject,
                                clockObject,
                            ],
                        });

                        const txBytes = await tx.build({
                            client: suiClient,
                            onlyTransactionKind: true,
                        });

                        const decryptedObject = await sealClient.decrypt({
                            data: fileBuffer,
                            sessionKey: sessionKey,
                            txBytes: txBytes
                        });

                        return decryptedObject;
                    },

                    onError: (error) => {
                        console.log("Personal message signature set! Result is:", error)
                    }
                });
            } catch (error) {
                console.log("An error occurred while setting personal message:", error)
            }
        }
    });

    return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
};
