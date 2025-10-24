import { useQuery } from "@tanstack/react-query";
import { WalrusClient, WalrusFile, WalrusBlob } from "@mysten/walrus";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

// Setup client once
const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

export const useFetchFromWalrus = (params: { blobId?: string, identifier?: string }) => {
  return useQuery<WalrusFile[] | null, Error>({
    queryKey: ["walrus-quilt-file", params.blobId, params.identifier],
    enabled: !!params.blobId, // Only need blobId to fetch the quilt
    queryFn: async () => {
      const { blobId, identifier } = params;

      if (!blobId) {
        throw new Error("Quilt ID is required.");
      }
      
      try {
        // First, get the entire quilt as a WalrusBlob
        const walrusBlob = await walrusClient.getBlob({ blobId });
        
        // If an identifier was provided, filter the files
        if (identifier) {
          const files = await walrusBlob.files({ identifiers: [identifier] });
          return files;
        }

        // If no identifier was provided, return all files in the quilt
        const allFiles = await walrusBlob.files();
        return allFiles;

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
