import { CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  vaultName?: string
  walrusCid?: string
}

export default function SuccessModal({ open, onClose, vaultName, walrusCid }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
        <DialogHeader className="text-center space-y-3">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vault Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Your vault <span className="font-semibold">{vaultName}</span> is live and sealed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-left text-sm break-all">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Walrus CID:</p>
          <p className="text-gray-600 dark:text-gray-400">{walrusCid}</p>
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(walrusCid|| "")
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Copy CID
          </Button>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
