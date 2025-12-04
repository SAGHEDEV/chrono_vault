export interface VaultFile {
  id: string;
  name: string;
  size: string;
  sealId: string;
  blobId: string;
}

export interface VaultType {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  unlockDate: string;
  status: "locked" | "unlocked" | "pending";
  custodyCount: number;
  files: VaultFile[];
  authorizedAddresses: string[];
  sealIds: string[];
  blobIds: string[];
  owner?: string;
}