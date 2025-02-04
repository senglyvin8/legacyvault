'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { UserData } from '@/types/user'
import { loginUser } from '@/lib/api'

interface LoginPageProps {
    onLogin: (userData: UserData) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [showNricModal, setShowNricModal] = useState(false)
    const [nric, setNric] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        if (!nric.trim()) {
            setError('Please enter your NRIC/FIN number')
            return
        }

        setError('')
        setIsLoading(true)
        
        try {
            console.log('Frontend - Sending NRIC to backend:', nric);
            
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nric }),
            });

            if (!response.ok) {
                throw new Error('Invalid NRIC');
            }

            const userData = await response.json();
            console.log('Frontend - Received user data:', userData);
            
            // Validate received data against schema
            if (!userData.personal_info?.nric_fin || 
                typeof userData.personal_info.deceased !== 'boolean' || 
                typeof userData.personal_info.sgfindex_status !== 'boolean') {
                throw new Error('Invalid user data format');
            }
            
            // Store user data in localStorage for persistence
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setError("");
            setShowNricModal(false);
            onLogin(userData);
        } catch (error) {
            setError("Invalid NRIC. User not found in database.");
            localStorage.removeItem('userData'); // Clear any existing data
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleLogin()
    }

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
                    <Button 
                        variant="outline" 
                        className="text-blue-600" 
                        onClick={() => setShowNricModal(true)}
                        disabled={isLoading}
                    >
                        Login
                    </Button></div>
                </div>
            </header>

            {/* NRIC Modal */}
            <Dialog open={showNricModal} onOpenChange={setShowNricModal}>
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={handleSubmit} className="text-center py-4">
                        <h2 className="font-semibold mb-6">Please enter your NRIC/FIN number</h2>
                        <Input
                            type="text"
                            className="mb-4 text-center"
                            placeholder="Enter your NRIC/FIN number"
                            value={nric}
                            onChange={(e) => setNric(e.target.value)}
                            disabled={isLoading}
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <Button
                            type="submit"
                            className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Checking...' : 'Login'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <main className="mx-auto px-40 min-h-screen bg-[url('https://file.go.gov.sg/hfpg2025-vaultbg.jpg')] bg-cover bg-left pl-28 pt-20">
            <div className="relative z-10 text-left">
                <img 
    src="https://file.go.gov.sg/hfpg2025-mylegacyvaultlogo.png" 
    alt="My Legacy Vault Logo" 
    className="mb-6"
    style={{ width: '220px', height: 'auto' }}
        />
                    <h1 className="font-bold text-[40px] leading-tight mb-4">
                        Make things easier<br></br>for your loved ones
                    </h1>
                    <p className="mb-12">Use My Legacy Vault to store information<br></br> 
                                        on your assets and financial accounts,<br></br> 
                                        so your loved ones can find out<br></br>  
                         what’s been left behind.</p>
                    <div className="space-y-6">
                        <Button
                            className="px-8 bg-[#3176B5] hover:bg-[#24588D] text-white font-semibold rounded-md"
                            
                            onClick={() => setShowNricModal(true)}
                            disabled={isLoading}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </main>

            
        </div>
        
    )

    
}