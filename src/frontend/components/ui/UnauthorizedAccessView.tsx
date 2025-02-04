'use client'

import { Button } from './button'
import { motion } from 'framer-motion'

interface UnauthorizedAccessViewProps {
    deceasedName: string
    onRequestAccess: () => void
}

export function UnauthorizedAccessView({ deceasedName, onRequestAccess }: UnauthorizedAccessViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto text-center py-8 px-4"
        >
            <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-4">
                    <img src="https://file.go.gov.sg/hfpg2025-vaultkey.png" alt="Key icon" className="w-full h-full" />
                </div>
                <h2 className="text-lg font-semibold mb-4">
                    You have not been assigned<br></br> 
                    access to {deceasedName}'s vault.
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                Request access by clicking the button below,<br></br> 
                or use <a href="#" className="text-blue-600">My Legacy Link</a> to request information<br></br>
                directly from financial institutions.
                </p>
                <Button
                    className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-4"
                    onClick={onRequestAccess}
                >
                    Request Access
                </Button>
            </div>
            
    
        </motion.div>
    )
} 