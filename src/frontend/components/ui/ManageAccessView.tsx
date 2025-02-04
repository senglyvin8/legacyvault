'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { motion } from 'framer-motion'
import { UserData } from '@/types/user'

interface ManageAccessViewProps {
    userData: UserData
    onUpdateAccess: (updatedData: UserData) => void
    onBack: () => void
}

export function ManageAccessView({ userData, onUpdateAccess, onBack }: ManageAccessViewProps) {
    const [newNric, setNewNric] = useState('')

    const handleAddAccess = async () => {
        if (!newNric) return

        const updatedData = {
            ...userData,
            vault_access: [
                ...userData.vault_access,
                { nric_fin: newNric }
            ]
        }

        try {
            const response = await fetch('http://localhost:8000/api/update-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nric: userData.personal_info.nric_fin,
                    userData: updatedData
                }),
            })

            if (response.ok) {
                onUpdateAccess(updatedData)
                setNewNric('')
            }
        } catch (error) {
            console.error('Error updating access:', error)
        }
    }

    const handleRemoveAccess = async (nricToRemove: string) => {
        const updatedData = {
            ...userData,
            vault_access: userData.vault_access.filter(
                access => access.nric_fin !== nricToRemove
            )
        }

        try {
            const response = await fetch('http://localhost:8000/api/update-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nric: userData.personal_info.nric_fin,
                    userData: updatedData
                }),
            })

            if (response.ok) {
                onUpdateAccess(updatedData)
            }
        } catch (error) {
            console.error('Error removing access:', error)
        }
    }

    return (
        <div className="min-h-screen bg-white">
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
                        Back
                    </Button></div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto py-8 px-6"
            >
                <h2 className="text-xl font-bold mb-6 pl-4 pr-4">Manage access to your vault</h2>
                
                <div className="mb-6">
                    <p className="text-grey-800 pl-4 pr-4">
                        In the event of your death, the following individuals will be given access to your vault.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Add new access */}
                    
                    <div className="flex gap-4 pl-4 pr-4">
                        <Input
                            value={newNric}
                            onChange={(e) => setNewNric(e.target.value)}
                            placeholder="Enter NRIC/FIN"
                            className="flex-1"
                        />
                        <Button 
                            onClick={handleAddAccess}
                            className="w-[100px] bg-[#2FC92F] hover:bg-[#26A826] text-white"
                        >
                            Add Person
                        </Button>
                    </div>

                    {/* Access list */}
                    <div className="space-y-2">
                        {userData.vault_access.map((access, index) => (
                            <div 
                                key={index}
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg pl-6"
                            >
                                <span>{access.nric_fin}</span>
                                <Button
                                    variant="destructive"
                                
                                    onClick={() => handleRemoveAccess(access.nric_fin)}
                                    className="w-[100px] bg-[#EE404C] hover:bg-[#CC1F30] text-white"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button 
    onClick={onBack}
    className="w-[100px] bg-[#3176B5] hover:bg-[#24588D] text-white ml-4">
    Save
</Button>


                </div>
            </motion.div>
        </div>
    )
} 
