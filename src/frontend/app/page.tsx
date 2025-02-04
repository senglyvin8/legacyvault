'use client'

import { useState } from 'react'
import { LoginPage } from '@/components/ui/LoginPage'
import { MainDashboard } from '@/components/ui/MainDashboard'
import { VaultDashboard } from '@/components/ui/VaultDashboard'
import { DeceasedVaultPage } from '@/pages/DeceasedVaultPage'
import type { UserData } from '@/types/user'

export default function Home() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [currentView, setCurrentView] = useState<'main' | 'vault' | 'deceased-vault'>('main')
    const [deceasedVaultData, setDeceasedVaultData] = useState<any>(null)

    const handleLogin = (data: UserData) => {
        setUserData(data)
    }

    const handleLogout = () => {
        setUserData(null)
        setCurrentView('main')
    }

    const handleNavigateHome = () => {
        setUserData(null)
        setCurrentView('main')
    }

    if (!userData) {
        return <LoginPage onLogin={handleLogin} />
    }

    return (
        <>
            {currentView === 'main' && (
                <MainDashboard
                    userData={userData}
                    onUpdateUserData={setUserData}
                    onNavigateHome={handleNavigateHome}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    setDeceasedData={setDeceasedVaultData}
                />
            )}
            {currentView === 'vault' && (
                <VaultDashboard
                    userData={userData}
                    onUpdateUserData={setUserData}
                    onNavigateHome={handleNavigateHome}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />
            )}
            {currentView === 'deceased-vault' && deceasedVaultData && (
                <DeceasedVaultPage
                    vaultData={deceasedVaultData}
                    onBack={() => setCurrentView('main')}
                />
            )}
        </>
    )
}