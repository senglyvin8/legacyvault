'use client'

import { DeceasedVaultView } from "@/components/ui/DeceasedVaultView"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DeceasedVaultPageProps {
    vaultData: any;
    onBack: () => void;
}

export function DeceasedVaultPage({ vaultData, onBack }: DeceasedVaultPageProps) {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 px-4 py-2 pl-12">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://file.go.gov.sg/hfpg2025-mylegacylogo.png"
                            alt="MyLegacyVault Logo"
                            className="h-6"
                        />
                        
                    </div>
                    <div className="flex items-center gap-8 pr-12">
                    <span className="text-sm text-gray-600">Home</span>
                    <span className="text-sm text-gray-600">End-of-life Planning</span>
                    <span className="text-sm text-gray-600">When death happens</span>
                    <span className="text-sm text-gray-600">My Legacy Tools</span>
                    <Button variant="outline" onClick={onBack}>
                        Home
                    </Button></div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto py-8 px-4"
            >
                <DeceasedVaultView vaultData={vaultData} />
            </motion.div>
        </div>
    )
} 