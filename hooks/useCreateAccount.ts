import { CLOCK_ID } from "@/config/vault-config";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";

const ACCOUNT_ROOT_ID = process.env.NEXT_PUBLIC_ACCOUNT_ROOT_ID!;
const PACKAGE_ID = process.env.NEXT_PUBLIC_CHRONOVAULT_PACKAGE_ID!;

export function useCreateAccount() {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation<any, Error, { user_name: string }>({
        mutationFn: async ({
            user_name,
        }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::vault_access::create_account`,
                arguments: [
                    tx.object(ACCOUNT_ROOT_ID),
                    tx.pure.string(user_name),
                    tx.object(CLOCK_ID),
                ],
            });

            const result = await signAndExecuteTransaction({
                transaction: tx,
            });

            console.log('✅ Account created successfully:', result);

            return {
                transactionDigest: result.digest,
            };
        },
        onError: (error) => {
            console.error('❌ Error creating account:', error);
        },
        onSuccess: (data) => {
            console.log('✅ Account created successfully with ID:', data.transactionDigest);
        },
    });

    return {
        createAccount: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}