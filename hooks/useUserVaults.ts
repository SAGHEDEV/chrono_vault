import { VaultType } from "@/types/index.t";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";
import { deriveObjectID } from '@mysten/sui/utils';
import { useMemo } from "react";

const ACCOUNT_ROOT_ID = process.env.NEXT_PUBLIC_ACCOUNT_ROOT_ID!;
const PACKAGE_ID = process.env.NEXT_PUBLIC_CHRONOVAULT_PACKAGE_ID!;

/**
 * Hook to get user's Account object (derived object)
 */

function profileAddress(address: string): string {
  return deriveObjectID(
    ACCOUNT_ROOT_ID,
    'address',
    bcs.Address.serialize(address).toBytes(),
  )
}

export function useUserAccount() {
  const currentAccount = useCurrentAccount();

  // If no account is connected, return early with proper structure
  if (!currentAccount) {
    return {
      account: null,
      isLoading: false,
      error: null,
      refetch: () => { },
    };
  }

  const accountAddress = profileAddress(currentAccount.address);

  console.log(accountAddress)

  const {
    data: accountData,
    isLoading,
    error,
    refetch,
  } = useSuiClientQuery(
    "getObject",
    {
      id: accountAddress,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    },
    {
      enabled: !!accountAddress,
    }
  );

  console.log("Account data:", accountData);

  const account = useMemo(() => {
    if (!accountData?.data?.content || accountData.data.content.dataType !== "moveObject") {
      return null;
    }
    return {
      id: accountData.data.objectId,
      fields: accountData.data.content.fields,
    };
  }, [accountData]);

  console.log("Account", account)

  return {
    account,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Main hook to get user's vaults (owned by their Account derived object)
 */
export function useUserVaults() {
  const { account, isLoading: isLoadingAccount } = useUserAccount();

  // Get vaults owned by the user's Account object
  const {
    data: vaultsData,
    isLoading: isLoadingVaults,
    error: vaultsError,
    refetch: refetchVaults,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.id!, // Query by Account object ID, not user address
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
      filter: {
        StructType: `${PACKAGE_ID}::vault_access::VaultPolicy`,
      },
    },
    {
      enabled: !!account?.id,
      refetchInterval: 30000,
    }
  );

  console.log("Vaults data:", vaultsData);

  // Parse vaults
  const parsedVaults = useMemo(() => {
    if (!vaultsData?.data) return [];

    return vaultsData.data
      .map((vault: any) => parseVaultData(vault))
      .filter(Boolean) as VaultType[];
  }, [vaultsData]);

  const isLoading = isLoadingAccount || isLoadingVaults;

  return {
    vaults: parsedVaults,
    isLoading,
    error: vaultsError,
    refetch: refetchVaults,
  };
}

/**
 * Hook to get a single vault by ID
 */
export function useVault(vaultId: string) {
  const {
    data: vault,
    isLoading,
    error,
    refetch,
  } = useSuiClientQuery(
    "getObject",
    {
      id: vaultId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!vaultId,
    }
  );

  const parsedVault = useMemo(() => {
    if (!vault) return null;
    return parseVaultData(vault);
  }, [vault]);

  return {
    vault: parsedVault,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get vault statistics
 */
export function useVaultStats() {
  const { vaults, isLoading } = useUserVaults();

  const stats = useMemo(() => {
    const total = vaults.length;
    const locked = vaults.filter((v) => v.status === "locked").length;
    const unlocked = vaults.filter((v) => v.status === "unlocked").length;

    const now = Date.now();
    const oneDayFromNow = now + 24 * 60 * 60 * 1000;
    const pending = vaults.filter((v) => {
      if (!v.unlockDate || v.unlockDate === "N/A") return false;
      const unlockTs = Date.parse(v.unlockDate);
      return unlockTs > now && unlockTs <= oneDayFromNow;
    }).length;

    const totalFiles = vaults.reduce((sum, v) => sum + v.files.length, 0);

    const lockedVaults = vaults
      .filter((v) => v.status === "locked" && v.unlockDate !== "N/A")
      .sort((a, b) => {
        const ta = Date.parse(a.unlockDate!);
        const tb = Date.parse(b.unlockDate!);
        return ta - tb;
      });

    const nextUnlock = lockedVaults[0]?.unlockDate || null;
    const nextUnlockTs = nextUnlock ? Date.parse(nextUnlock) : null;
    const daysUntilNextUnlock = nextUnlockTs
      ? Math.ceil((nextUnlockTs - now) / (1000 * 60 * 60 * 24))
      : null;

    return {
      total,
      locked,
      unlocked,
      pending,
      totalFiles,
      nextUnlock,
      daysUntilNextUnlock,
    };
  }, [vaults]);

  return { stats, isLoading };
}

/**
 * Hook to get filtered vaults
 */
export function useFilteredVaults(filter: "all" | "locked" | "unlocked" | "pending") {
  const { vaults, isLoading, error } = useUserVaults();

  const filteredVaults = useMemo(() => {
    if (filter === "all") return vaults;

    if (filter === "locked") {
      return vaults.filter((v) => v.status === "locked");
    }

    if (filter === "unlocked") {
      return vaults.filter((v) => v.status === "unlocked");
    }

    if (filter === "pending") {
      const now = Date.now();
      const oneDayFromNow = now + 24 * 60 * 60 * 1000;
      return vaults.filter((v) => {
        if (!v.unlockDate || v.unlockDate === "N/A") return false;
        const unlockTs = Date.parse(v.unlockDate);
        return unlockTs > now && unlockTs <= oneDayFromNow;
      });
    }

    return vaults;
  }, [vaults, filter]);

  return { vaults: filteredVaults, isLoading, error };
}

/**
 * Hook to search vaults by name or description
 */
export function useSearchVaults(searchTerm: string) {
  const { vaults, isLoading, error } = useUserVaults();

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return vaults;

    const term = searchTerm.toLowerCase();
    return vaults.filter(
      (vault) =>
        vault.title.toLowerCase().includes(term) ||
        vault.description.toLowerCase().includes(term)
    );
  }, [vaults, searchTerm]);

  return { vaults: searchResults, isLoading, error };
}

/**
 * Hook to get recently created vaults
 */
export function useRecentVaults(limit: number = 4) {
  const { vaults, isLoading, error } = useUserVaults();
  console.log(vaults)

  const recentVaults = useMemo(() => {
    return [...vaults]
      .sort((a, b) => {
        const dateA = a.uploadDate ? Date.parse(a.uploadDate) : 0;
        const dateB = b.uploadDate ? Date.parse(b.uploadDate) : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }, [vaults, limit]);

  return { vaults: recentVaults, isLoading, error };
}

/**
 * Hook to get a single vault by ID
 */
export function useSingleVault(vaultId: string) {
  const {
    data: vault,
    isLoading,
    error,
    refetch,
  } = useSuiClientQuery(
    "getObject",
    {
      id: vaultId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!vaultId,
    }
  );

  const parsedVault = useMemo(() => {
    if (!vault) return null;
    return parseVaultData(vault);
  }, [vault]);

  return {
    vault: parsedVault,
    isLoading,
    error,
    refetch,
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse a single vault object from Sui query result
 */
function parseVaultData(vault: any): VaultType | null {
  if (!vault.data?.content || vault.data.content.dataType !== "moveObject") {
    return null;
  }

  const fields = vault.data.content.fields;

  // Parse basic fields
  const vaultName = decodeBytes(fields.vault_name || []);
  const description = decodeBytes(fields.description || []);
  const unlockTime = parseInt(fields.unlock_time || "0");
  const createdAt = parseInt(fields.created_at || "0");

  // Parse files (FileMetadata vector)
  const files = (fields.files || []).map((fileMetadata: any, index: number) => {
    const parsedFile = parseFileMetadata(fileMetadata.fields);

    console.log(parsedFile)

    return {
      id: parsedFile.sealId,
      name: parsedFile.file_identifier || `File ${index + 1}`,
      size: "Unknown", // Size not stored in contract
      blobId: parsedFile.blobId,
      sealId: parsedFile.sealId,
    };
  });

  // Determine lock status
  const currentTime = Date.now();
  const isLocked = unlockTime > 0 && currentTime < unlockTime;

  // Helper function to format date with time
  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const hoursStr = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} at ${hoursStr}:${minutes}${ampm}`;
  };

  // Format dates with time
  const uploadDate = createdAt > 0
    ? formatDateTime(createdAt)
    : formatDateTime(Date.now());

  const unlockDate = unlockTime > 0
    ? formatDateTime(unlockTime)
    : "N/A";

  return {
    id: vault.data.objectId,
    title: vaultName,
    description: description,
    uploadDate,
    unlockDate,
    status: isLocked ? "locked" : "unlocked",
    custodyCount: files.length,
    files,
    owner: fields.owner,
    authorizedAddresses: fields.authorized_addresses || [],
    // Legacy fields for backward compatibility
    sealIds: files.map((f: any) => f.sealId),
    blobIds: files.map((f: any) => f.blobId),
  };
}

/**
 * Parse FileMetadata from contract
 */
function parseFileMetadata(fileMetadata: any): {
  name: string;
  sealId: string;
  blobId: string;
  file_identifier: string;
} {
  return {
    name: decodeBytes(fileMetadata.file_identifier || []),
    sealId: Array.from(fileMetadata.seal_id || [])
      .map((b: number | unknown) => b?.toString() || "".padStart(2, '0'))
      .join(''),
    file_identifier: decodeBytes(fileMetadata.file_identifier || []),
    blobId: decodeBytes(fileMetadata.blob_id || []),
  };
}

/**
 * Decode bytes to string
 */
function decodeBytes(bytes: number[] | Uint8Array): string {
  if (!bytes || bytes.length === 0) return "";
  const uint8Array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return new TextDecoder().decode(uint8Array);
}