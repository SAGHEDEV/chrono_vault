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
      <DialogContent className="sm:max-w-md min-w-[500px] brutalist-card border-3 border-black shadow-[8px_8px_0px_0px_rgba(26,115,232,1)] bg-white">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-[#4FC3F7] border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
            <CheckCircle2 className="h-12 w-12 text-[#0A0A0A]" strokeWidth={3} />
          </div>
          <DialogTitle className="text-2xl font-black text-[#0A0A0A] text-center uppercase tracking-wide">
            Vault Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-[#0B2A4A] text-center font-bold text-base">
            Your vault <span className="font-black text-[#1A73E8]">{vaultName}</span> is live and sealed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 border-3 border-black bg-[#E3F2FD] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
          <p className="font-black text-[#0A0A0A] mb-2 uppercase text-xs tracking-wide">Vault ID:</p>
          <p className="text-[#0B2A4A] font-bold text-sm break-all font-mono">{vaultId}</p>
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              router.push(`https://testnet.suivision.xyz/txblock/${vaultId}`)
            }}
            className="w-full sm:w-auto brutalist-btn bg-white text-[#0A0A0A] hover:bg-[#E3F2FD] cursor-pointer font-black"
          >
            View on Explorer
          </Button>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto brutalist-btn bg-[#1A73E8] text-white hover:bg-[#0B2A4A] cursor-pointer font-black"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
