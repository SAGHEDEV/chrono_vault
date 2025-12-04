import { CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  vaultName?: string
  vaultId?: string
}

export default function SuccessModal({ open, onClose, vaultName, vaultId }: SuccessModalProps) {
  const router = useRouter()
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md min-w-[500px] rounded-2xl bg-white dark:bg-gray-900">
        <DialogHeader className="text-center space-y-2">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Vault Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
            Your vault <span className="font-semibold">{vaultName}</span> is live and sealed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-left text-sm break-all">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Vault ID:</p>
          <p className="text-gray-600 dark:text-gray-400 w-full max-w-[280px] md:max-w-[400px] truncate">{vaultId}</p>
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              router.push(`https://testnet.suivision.xyz/txblock/${vaultId}`)
            }}
            variant="outline"
            className="w-full sm:w-auto text-white hover:text-gray-300 cursor-pointer"
          >
            View on Explorer
          </Button>
          <Button onClick={onClose} className="w-full sm:w-auto text-white hover:text-gray-300 cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
