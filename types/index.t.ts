export interface VaultFile {
  id: string;
  name: string;
  size: string;
}

export interface VaultType {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  unlockDate: string;
  status: "locked" | "unlocked" | "pending";
  custodyCount: number;
  walrusCid: string;
  files: VaultFile[];
}