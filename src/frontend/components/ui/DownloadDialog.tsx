'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'

interface DownloadDialogProps {
    isOpen: boolean
    onClose: () => void
    fileName: string
    onDownload: () => void
}

export function DownloadDialog({ isOpen, onClose, fileName, onDownload }: DownloadDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    
                </DialogHeader>
                <div className="text-center space-y-4 py-0">
                    <p className="font-semibold mb-0">Your file is ready to download.</p>
                    <p className="font">{fileName}</p>
                    <Button
                        className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-2"
                        onClick={onDownload}
                    >
                        Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 