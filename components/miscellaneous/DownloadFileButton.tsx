import { Download } from "lucide-react"
import { Button } from "../ui/button"
import { useDecryptVaultFile } from "@/hooks/useDecryptVaultFIle"

const DownloadFileButton = ({ sealId, vaultId, quiltId, identifier }: { sealId: string, vaultId: string, quiltId: string, identifier: string }) => {
    const { decrypt, isLoading } = useDecryptVaultFile();

    const handleDecrypt = async () => {
        try {
            const result = await decrypt({ quiltId, identifier, vault_id: vaultId, seal_id: sealId });
            console.log("Success:", result);
        } catch (err) {
            console.error("Failed:", err);
        }
    }; return (
        <Button size="sm" className="flex-shrink-0 brutalist-btn rounded-2xl cursor-pointer w-full" onClick={handleDecrypt} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Downloading..." : "Download"}
        </Button>
    )
}

export default DownloadFileButton;