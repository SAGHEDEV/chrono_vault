export interface VaultFile {
  id: string;
  name: string;
  size: string;
  sealId: string;
  blobId: string;
}

export interface CustodyRecord {
  custodian: string;
  transferred_at: string;
  transaction_digest: string;
}

export interface VaultType {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  unlockDate: string;
  status: "locked" | "unlocked" | "pending";
  custodyCount: number; // Number of custody transfers
  custodyTrail: CustodyRecord[]; // Full custody history
  files: VaultFile[];
  authorizedAddresses: string[];
  sealIds: string[];
  blobIds: string[];
  owner?: string;
}