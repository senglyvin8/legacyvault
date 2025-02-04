'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Input } from './input'
import { Button } from './button'
import { UnauthorizedAccessView } from './UnauthorizedAccessView'
import { NotFoundView } from './NotFoundView'
import { UserData } from '@/types/user'

interface RetrieveVaultDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (nric: string) => void
    userData: UserData
}

export function RetrieveVaultDialog({ isOpen, onClose, onSubmit, userData }: RetrieveVaultDialogProps) {
    const [nric, setNric] = useState('')
    const [showUnauthorized, setShowUnauthorized] = useState(false)
    const [showNotFound, setShowNotFound] = useState(false)
    const [deceasedName, setDeceasedName] = useState('')

    const handleSubmit = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/check-access/${nric}?requester_nric=${userData.personal_info.nric_fin}`
            )
    
            const data = await response.json()
    
            if (data.status === 'not_deceased') {
                setShowNotFound(true)  // Always show NotFoundView if not deceased
            } else if (data.status === 'authorized') {
                onSubmit(nric)  // Show content if access is granted
            } else if (data.status === 'unauthorized' && data.is_deceased) {
                setDeceasedName(data.name)  // Only show unauthorized view if deceased
                setShowUnauthorized(true)
            } else {
                setShowNotFound(true)  // Default to NotFoundView
            }
        } catch (error) {
            console.error('Error checking access:', error)
        }
    }

    const handleRequestAccess = () => {
        // TODO: Implement access request form
        console.log('Request access for:', nric)
    }

    if (showNotFound) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-xl">
                    <NotFoundView onReturn={() => setShowNotFound(false)} />
                </DialogContent>
            </Dialog>
        )
    }

    if (showUnauthorized) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-xl">
                    <UnauthorizedAccessView
                        deceasedName={deceasedName}
                        onRequestAccess={handleRequestAccess}
                    />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <h2 className="text-center font-semibold mt-4"> 
                        Please enter the deceased's NRIC/FIN Number
                    </h2>
                </DialogHeader>
                <div className="space-y-6 py-0 mb-4">
                    <Input
                        value={nric}
                        onChange={(e) => setNric(e.target.value)}
                        placeholder="Enter NRIC/FIN Number"
                        className="text-center"
                    />
                    <Button
                        className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}