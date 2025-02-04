'use client'

import { useState } from 'react'
import { Button } from './button'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'
import { DownloadDialog } from './DownloadDialog'

interface Account {
    bank_name?: string
    card_name?: string
    insurance_name?: string
    accountNumber?: string
    policyNumber?: string
    amount?: number
    source: string
}

interface DeceasedVaultData {
    name: string
    insurance: Account[]
    bank_accounts: Account[]
    credit_cards: Account[]
}

interface DeceasedVaultViewProps {
    vaultData: DeceasedVaultData
}

export function DeceasedVaultView({ vaultData }: DeceasedVaultViewProps) {
    const [showDownloadDialog, setShowDownloadDialog] = useState(false)
    const [excelFile, setExcelFile] = useState<{ buffer: any; name: string } | null>(null)

    const handleExport = async () => {
        // Create a new workbook
        const wb = XLSX.utils.book_new()

        // Format bank accounts data
        const bankData = vaultData.bank_accounts.map(account => ({
            'Bank Name': account.bank_name,
            'Account Number': account.accountNumber,
            'Amount': account.amount?.toFixed(2),
            'Source': account.source
        }))
        const bankSheet = XLSX.utils.json_to_sheet(bankData)
        XLSX.utils.book_append_sheet(wb, bankSheet, 'Bank Accounts')

        // Format credit cards data
        const cardData = vaultData.credit_cards.map(card => ({
            'Card Name': card.card_name,
            'Card Number': card.accountNumber,
            'Source': card.source
        }))
        const cardSheet = XLSX.utils.json_to_sheet(cardData)
        XLSX.utils.book_append_sheet(wb, cardSheet, 'Credit Cards')

        // Format insurance data
        const insuranceData = vaultData.insurance.map(policy => ({
            'Insurance Name': policy.insurance_name,
            'Policy Number': policy.policyNumber,
            'Source': policy.source
        }))
        const insuranceSheet = XLSX.utils.json_to_sheet(insuranceData)
        XLSX.utils.book_append_sheet(wb, insuranceSheet, 'Insurance Policies')

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0]
        const fileName = `${vaultData.name}_vault_data_${timestamp}.xlsx`

        // Write to buffer instead of file
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        
        // Save to state and show dialog
        setExcelFile({ buffer, name: fileName })
        setShowDownloadDialog(true)

        // Also save to backend
        try {
            const formData = new FormData()
            formData.append('file', new Blob([buffer]), fileName)
            
            const response = await fetch('http://localhost:8000/api/save-excel', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to save file')
            }
        } catch (error) {
            console.error('Error saving file:', error)
        }
    }

    const handleDownload = () => {
        if (!excelFile) return

        // Create blob and download
        const blob = new Blob([excelFile.buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = excelFile.name
        a.click()
        window.URL.revokeObjectURL(url)
        setShowDownloadDialog(false)
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto p-4"

                
            >
                
                <div className="space-y-4 mb-8 p-4">
                    <img
                            src="https://file.go.gov.sg/hfpg2025-mylegacyvaultlogo.png"
                            alt="MyLegacyVault Logo"
                            className="h-8"
                        />
                        </div>

                        <div className="flex justify-between items-center mb-4 bg-gray-100 p-4">
                    <h2 className="text-xl font-bold">{vaultData.name}'s Vault</h2>
                    
                </div>

                <div className="space-y-6 p-4">
                    {/* Bank Accounts Section */}
                    <section>
                        <h3 className="text-xl font-bold mt-8 mb-6">Bank Accounts</h3>
                        <div className="space-y-2">
                            {vaultData.bank_accounts.map((account, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <div className="font-medium">{account.bank_name}</div>
                                        <div className="text-sm text-gray-500">Account Number: {account.accountNumber}</div>
                                        <div className="text-sm text-gray-500">Amount: ${account.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="text-right">
                                        
                                        <div className="text-sm text-gray-500">{account.source}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Credit Cards Section */}
                    <section>
                        <h3 className="text-xl font-bold mt-24 mb-6">Credit Cards</h3>
                        <div className="space-y-2">
                            {vaultData.credit_cards.map((card, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <div className="font-medium">{card.card_name}</div>
                                        <div className="text-sm text-gray-500">Credit Card</div>
                                    </div>
                                    <div className="text-sm text-gray-500">{card.source}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Insurance Section */}
                    <section>
                    <h3 className="text-xl font-bold mt-24 mb-6">Insurance Policies</h3>
                        <div className="space-y-2">
                            {vaultData.insurance.map((policy, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <div className="font-medium">{policy.insurance_name}</div>
                                        <div className="text-sm text-gray-500">Policy Number: {policy.policyNumber}</div>
                                    </div>
                                    <div className="text-sm text-gray-500">{policy.source}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="mt-24 mb-8 p-4">
                <Button
                        variant="default"
                        className="px-8 bg-[#3176B5] hover:bg-[#24588D] text-white font-semibold rounded-md"
                        onClick={handleExport}
                    >
                        Export XLS
                    </Button></div>

            </motion.div>

            <DownloadDialog
                isOpen={showDownloadDialog}
                onClose={() => setShowDownloadDialog(false)}
                fileName={excelFile?.name || ''}
                onDownload={handleDownload}
            />
        </>
    )
}