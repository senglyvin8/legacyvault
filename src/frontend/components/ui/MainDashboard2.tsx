'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { UserData } from "@/types/user";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RetrieveVaultDialog } from './RetrieveVaultDialog'
import { DeceasedVaultView } from './DeceasedVaultView'

interface MainDashboardProps {
    onNavigateHome: () => void;
    userData: UserData;
    onUpdateUserData: (updatedData: UserData) => void;
    currentView: 'main' | 'vault' | 'deceased-vault';
    setCurrentView: (view: 'main' | 'vault' | 'deceased-vault') => void;
    setDeceasedData: (data: any) => void;
}

export function MainDashboard({ 
    userData, 
    onUpdateUserData, 
    onNavigateHome, 
    currentView, 
    setCurrentView,
    setDeceasedData 
}: MainDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [showRetrieveDialog, setShowRetrieveDialog] = useState(false)

    useEffect(() => {
        // Check for stored user data on component mount
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedData = JSON.parse(storedUserData);
                // Validate data structure
                if (parsedData.personal_info && 
                    typeof parsedData.personal_info.deceased === 'boolean' &&
                    typeof parsedData.personal_info.sgfindex_status === 'boolean') {
                    onUpdateUserData(parsedData);
                }
            } catch (error) {
                console.error('Invalid stored user data');
                localStorage.removeItem('userData');
            }
        }
        setLoading(false);
    }, []);

    // Update logout handler
    const handleLogout = () => {
        localStorage.removeItem('userData');
        onNavigateHome();
    }

    const handleRetrieveSubmit = async (nric: string) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/deceased-vault/${nric}?requester_nric=${userData.personal_info.nric_fin}`
            );
            
            if (!response.ok) {
                if (response.status === 403) {
                    alert('You do not have access to this vault');
                    return;
                }
                throw new Error('Failed to fetch vault data');
            }
            
            const data = await response.json();
            setDeceasedData(data);
            setShowRetrieveDialog(false);
            setCurrentView('deceased-vault');
            
        } catch (error) {
            console.error('Error fetching vault data:', error);
            alert('Failed to retrieve vault data');
        }
    }

    if (loading || !userData || !userData.personal_info) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="MyLegacyVault Logo"
                            className="h-8 w-8"
                        />
                        <span className="text-xl font-semibold">MyLegacyVault</span>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto mt-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Welcome Message */}
                    <h1 className="text-2xl font-semibold text-center">
                        Hi {userData.personal_info.name}! What would you like to do today?
                    </h1>

                    {/* Deceased Status Check */}
                    {userData.personal_info.deceased && (
                        <div className="text-red-600 text-center mt-4">
                            This account belongs to a deceased person
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800"
                                onClick={() => setCurrentView('vault')}
                            >
                                Update information in my vault
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800"
                                onClick={() => setShowRetrieveDialog(true)}
                            >
                                Retrieve information from a loved one's vault
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </main>

            {showRetrieveDialog && (
                <RetrieveVaultDialog
                    isOpen={showRetrieveDialog}
                    onClose={() => setShowRetrieveDialog(false)}
                    onSubmit={handleRetrieveSubmit}
                    userData={userData}
                />
            )}
        </div>
    );
}