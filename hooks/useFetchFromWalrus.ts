import { useQuery } from "@tanstack/react-query";
import { WalrusClient } from "@mysten/walrus";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

// setup client once

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

export const useFetchFromWalrus = (blobId?: string) => {
  return useQuery({
    queryKey: ["walrus-blob", blobId],
    enabled: !!blobId,
    queryFn: async () => {
      if (!blobId) throw new Error("BlobId is required");

      try {
        const blob =await walrusClient.getBlob({ blobId });
        return blob;
      } catch (err: any) {
        console.error("Walrus fetch failed:", err);
        throw new Error(
          err?.message || "Unexpected error occurred while fetching from Walrus."
        );
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
