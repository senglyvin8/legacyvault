'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

interface BankSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete: () => void
}

interface Bank {
    id: string
    name: string
    logo: string
}

export function BankSelectionDialog({ open, onOpenChange, onComplete }: BankSelectionDialogProps) {
    const banks: Bank[] = [
        { id: 'dbs', name: 'DBS/POSB', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/DBS.svg' },
        { id: 'ocbc', name: 'OCBC', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/OCBC.svg' },
        { id: 'uob', name: 'UOB', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/UOB.svg' },
        { id: 'prudential', name: 'Prudential', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/3_prudential.svg' },
        { id: 'citi', name: 'Citibank', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/CITIBANK.svg' },
        { id: 'aia', name: 'AIA', logo: 'https://resource.fpdsapim.myinfo.gov.sg/images/AIA.svg' },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mt-2">
                    <div className="flex items-center">
                    <div className="flex items-center">
                        <img
                            src="https://file.go.gov.sg/hfpg2025-vaultsgfindex.png"
                            alt="MyLegacyVault Logo"
                            className="h-10"
                        />
                        
                    </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Select financial institutions to connect to SGFinDex.
                    </p>
                </div>

                {/* Bank Selection Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {banks.map((bank) => (
                        <motion.div
                            key={bank.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-3 flex items-center space-x-4 cursor-pointer hover:border-blue-500"
                        >
                            <Checkbox id={bank.id} />
                            <div className="flex items-center space-x-4 flex-1">
                            <div className="w-18 h-18 rounded flex items-center justify-center">
        {/* Bank logo */}
        <img
            src={bank.logo}
            alt="Bank Logo"
            className="w-14 h-6  object-contain"
        />
                                </div>
                                <label
                                    htmlFor={bank.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {bank.name}
                                </label>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <Button
                        className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-0"
                        onClick={onComplete}
                    >
                        Connect Selected Institutions
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}