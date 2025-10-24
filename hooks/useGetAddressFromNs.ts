import { useSuiClient } from "@mysten/dapp-kit"
import { SuinsClient } from '@mysten/suins';
import { useMutation } from "@tanstack/react-query";




export const useGetAddressFromNs = () => {
    const client = useSuiClient()
    const suinsClient = new SuinsClient({
        client, network: "testnet"
    })

    return useMutation<string, Error, string>({
        mutationFn: async (sui_ns: string) => {
            const ns_name = sui_ns.slice(0, 1)
            const nameRecord = await suinsClient.getNameRecord(ns_name);
            return nameRecord?.targetAddress as string
        },
        onError: (error: any) => {
            console.error(error.message || "Couldn't locate NS address");
        },
    })
}