'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { UserData } from "@/types/user";
import { RetrieveVaultDialog } from './RetrieveVaultDialog'
import { DeceasedVaultView } from './DeceasedVaultView'
import { NotFoundView } from './NotFoundView'

interface MainDashboardProps {
    onNavigateHome: () => void;
    userData: UserData;
    onUpdateUserData: (updatedData: UserData) => void;
    currentView: 'main' | 'vault' | 'deceased-vault' | 'not-found';
    setCurrentView: (view: 'main' | 'vault' | 'deceased-vault' | 'not-found') => void;
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
                if (response.status === 404) {
                    console.log('Setting current view to not-found');
                    setCurrentView('not-found');
    
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

    console.log('Current view:', currentView);

    if (currentView === 'not-found') {
        return <NotFoundView onReturn={() => setCurrentView('main')} />;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 px-4 py-2 pl-12">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://file.go.gov.sg/hfpg2025-mylegacylogo.png"
                            alt="MyLegacy Logo"
                            className="h-6"
                        />
                        
                    </div>
                    <div className="flex items-center gap-8 pr-12">
                    <span className="text-sm text-gray-600">Home</span>
                    <span className="text-sm text-gray-600">End-of-life Planning</span>
                    <span className="text-sm text-gray-600">When death happens</span>
                    <span className="text-sm text-gray-600">My Legacy Tools</span>                    
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                    </div>
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
                    <div className="space-y-0">
  <p className="text-center">Hi {userData.personal_info.name}!</p>
  <p className="font-semibold text-center text-xl">
    What would you like to do today?
  </p>
</div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex justify-center">
  <Button
    className="max-w-xs w-full bg-[#3176B5] hover:bg-[#24588D] text-white font-semibold rounded-md"
    onClick={() => setCurrentView('vault')}
  >
    Update information in my vault
  </Button>
</div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            
                            <div className="flex justify-center">
  <Button
    className="max-w-xs w-full bg-[#3176B5] hover:bg-[#24588D] text-white font-semibold rounded-md"
    onClick={() => setShowRetrieveDialog(true)}
>
    Retrieve information from a loved one's vault
    </Button>
  </div>


                            
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