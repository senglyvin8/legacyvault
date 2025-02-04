'use client'

import { Button } from './button'
import { motion } from 'framer-motion'

interface NotFoundViewProps {
    onReturn: () => void
}

export function NotFoundView({ onReturn }: NotFoundViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[350px] mx-auto text-center py-8 px-4"
        >
            <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-4">
                    <img src="https://file.go.gov.sg/hfpg2025-errortriangle.png" alt="Error Icon" className="w-full h-full" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                The NRIC/FIN number you entered does not belong to a confirmed deceased person. Please check and try again.
                </p>
                <Button
                    className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-4"
                    onClick={onReturn}
                >
                    Return
                </Button>
            </div>
        </motion.div>
    )
}