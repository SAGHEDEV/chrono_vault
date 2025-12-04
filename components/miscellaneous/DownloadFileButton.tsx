import { Download } from "lucide-react"
import { Button } from "../ui/button"
import { useDecryptVaultFile } from "@/hooks/useDecryptVaultFIle"

const DownloadFileButton = ({ sealId, vaultId, quiltId, identifier }: { sealId: string, vaultId: string, quiltId: string, identifier: string }) => {
    const { mutate, isLoading } = useDecryptVaultFile()
    return (
        <Button size="sm" className="flex-shrink-0 brutalist-btn rounded-2xl cursor-pointer w-full" onClick={() => mutate({ seal_id: sealId, vault_id: vaultId, quiltId, identifier: identifier })} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Downloading..." : "Download"}
        </Button>
    )
}

export default DownloadFileButton;