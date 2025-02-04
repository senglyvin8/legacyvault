'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { Plus, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { BankSelectionDialog } from "./BankSelectionDialog"
import { UserData } from "@/types/user"
import { SGFinDexAgreement } from "./SGFinDexAgreement"
import { AddEditAccountDialog, AccountData } from "./AddEditAccountDialog"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ManageAccessView } from './ManageAccessView'


interface VaultDashboardProps {
    userData: UserData;
    onUpdateUserData: (data: UserData) => void;
    onNavigateHome: () => void;
    currentView: 'main' | 'vault';
    setCurrentView: (view: 'main' | 'vault') => void;
}

interface AccountStatus {
    linked: boolean
    label: string
    buttonText: string
}

export function VaultDashboard({ userData, onUpdateUserData, onNavigateHome, currentView, setCurrentView }: VaultDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [showSGFinDexSetup, setShowSGFinDexSetup] = useState(false)
    const [showBankSelection, setShowBankSelection] = useState(false)
    const [showAgreement, setShowAgreement] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [statuses, setStatuses] = useState<AccountStatus[]>([
        {
            linked: userData?.personal_info.sgfindex_status || false,
            label: "Retrieve data from SGFinDex",
            buttonText: "Setup SGFinDex"
        },
        {
            linked: userData?.vault_access.length > 0,
            label: "Grant your loved ones access to your vault",
            buttonText: "Manage Access"
        }
    ])
    const [showAddAccount, setShowAddAccount] = useState(false)
    const [showEditAccount, setShowEditAccount] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null)
    const [accountType, setAccountType] = useState<'bank' | 'credit' | 'insurance'>('bank')
    const [bankAccounts, setBankAccounts] = useState(userData?.bank_accounts || [])
    const [creditCards, setCreditCards] = useState(userData?.credit_cards || [])
    const [insuranceAccounts, setInsuranceAccounts] = useState(userData?.insurance || [])
    const [showManageAccess, setShowManageAccess] = useState(false)

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            onUpdateUserData(parsedData);
            
            // Initialize state with stored data
            setBankAccounts(parsedData.bank_accounts || []);
            setCreditCards(parsedData.credit_cards || []);
            setInsuranceAccounts(parsedData.insurance || []);
            
            // Update SGFinDex status based on boolean value
            setStatuses(prev => prev.map((status, idx) =>
                idx === 0 ? { ...status, linked: parsedData.personal_info.sgfindex_status } : status
            ));
        }
        setLoading(false);
    }, []);

    // Update status when userData changes
    useEffect(() => {
        setStatuses([
            {
                linked: userData?.personal_info.sgfindex_status || false,
                label: "Retrieve data from SGFinDex",
                buttonText: "Setup SGFinDex"
            },
            {
                linked: userData?.vault_access.length > 0,
                label: "Grant your loved ones access to your vault",
                buttonText: "Manage Access"
            }
        ]);
    }, [userData]);

    if (loading || !userData) {
        return <div>Loading...</div>;
    }

    const handleSGFinDexSetup = () => {
        setShowSGFinDexSetup(true)
    }

    const handleConnectAccounts = () => {
        setShowSGFinDexSetup(false)  // Close the first dialog
        setShowBankSelection(true)    // Show bank selection dialog
    }

    const handleBankSelectionComplete = () => {
        setShowBankSelection(false)   // Close bank selection dialog
        setShowSGFinDexSetup(true)    // Show the first dialog again
        setIsConnected(true)          // Auto-check the "I have connected" checkbox
    }

    const handleProceed = () => {
        setShowSGFinDexSetup(false)
        setShowAgreement(true)
    }

    const handleAgree = async () => {
        try {
            // 1. Update SGFinDex status
            let updatedUserData = {
                ...userData,
                personal_info: {
                    ...userData.personal_info,
                    sgfindex_status: true
                }
            };

            // 2. Fetch SGFinDex data for the user
            const response = await fetch(`http://localhost:8000/api/sgfindex-data/${userData.personal_info.nric_fin}`);
            if (!response.ok) {
                throw new Error('Failed to fetch SGFinDex data');
            }
            const sgfindexData = await response.json();

            // 3. Merge bank accounts without duplicates
            const existingAccountNumbers = new Set(userData.bank_accounts.map(acc => acc.accountNumber));
            const newBankAccounts = sgfindexData.bank_accounts.filter(
                (acc: { accountNumber: string }) => !existingAccountNumbers.has(acc.accountNumber)
            ).map((acc: { bank_name: string; accountNumber: string; amount: number }) => ({
                ...acc,
                source: "Retrieved from SGFinDex"
            }));
            updatedUserData.bank_accounts = [...userData.bank_accounts, ...newBankAccounts];

            // 4. Merge credit cards without duplicates
            const existingCardNumbers = new Set(userData.credit_cards.map(card => card.accountNumber));
            const newCreditCards = sgfindexData.credit_cards.filter(
                (card: { accountNumber: string }) => !existingCardNumbers.has(card.accountNumber)
            ).map((card: { card_name: string; accountNumber: string }) => ({
                ...card,
                source: "Retrieved from SGFinDex"
            }));
            updatedUserData.credit_cards = [...userData.credit_cards, ...newCreditCards];

            // 5. Merge insurance policies without duplicates
            const existingPolicyNumbers = new Set(userData.insurance.map(ins => ins.policyNumber));
            const newInsurance = sgfindexData.insurance.filter(
                (ins: { policyNumber: string }) => !existingPolicyNumbers.has(ins.policyNumber)
            ).map((ins: { insurance_name: string; policyNumber: string }) => ({
                insurance_name: ins.insurance_name,
                policyNumber: ins.policyNumber,
                source: "Retrieved from SGFinDex"
            }));
            updatedUserData.insurance = [...userData.insurance, ...newInsurance];

            // 6. Update local state
            setBankAccounts(updatedUserData.bank_accounts);
            setCreditCards(updatedUserData.credit_cards);
            setInsuranceAccounts(updatedUserData.insurance);
            
            // 7. Update parent state and storage
            onUpdateUserData(updatedUserData);
            localStorage.setItem('userData', JSON.stringify(updatedUserData));

            // 8. Update backend
            const updateResponse = await fetch('http://localhost:8000/api/update-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nric: userData.personal_info.nric_fin,
                    userData: updatedUserData
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update user data');
            }

            // 9. Update UI status
            setStatuses(prev => prev.map((status, idx) =>
                idx === 0 ? { ...status, linked: true } : status
            ));
            
            setShowAgreement(false);
            setIsConnected(false); // Reset for next time

        } catch (error) {
            console.error('Error updating SGFinDex data:', error);
        }
    };

    const handleDecline = () => {
        setShowAgreement(false)
        setIsConnected(false) // Reset checkbox
    }

    const handleAddAccount = (type: 'bank' | 'credit' | 'insurance') => {
        setAccountType(type);
        setSelectedAccount(null); // Ensure no account is selected
        setShowAddAccount(true);
        setShowEditAccount(false);
    }

    const handleEditAccount = (account: AccountData, type: 'bank' | 'credit' | 'insurance') => {
        setSelectedAccount(account);
        setAccountType(type);
        setShowAddAccount(false);
        setShowEditAccount(true);
    }

    const handleSaveAccount = async (accountData: AccountData) => {
        if (accountType === 'insurance' && !accountData.policyNumber) return;
        
        try {
            let updatedUserData = { ...userData };
            
            if (showEditAccount && accountType === 'insurance') {
                // For insurance, only update the policy number
                const formattedInsurance = {
                    insurance_name: accountData.name,  // Keep original name
                    policyNumber: accountData.policyNumber,  // Update policy number
                    source: 'Manual Entry'
                };
                
                // Update the correct policy using originalAccountNumber
                const updatedInsurance = insuranceAccounts.map(insurance =>
                    insurance.policyNumber === accountData.originalAccountNumber
                        ? formattedInsurance
                        : insurance
                );
                
                // Update local state
                setInsuranceAccounts(updatedInsurance);
                updatedUserData.insurance = updatedInsurance;
                
                // Update parent state and storage
                onUpdateUserData(updatedUserData);
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                
                // Close dialog and reset selection
                setShowEditAccount(false);
                setSelectedAccount(null);
                
                // Update backend
                const response = await fetch('http://localhost:8000/api/update-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nric: userData.personal_info.nric_fin,
                        userData: updatedUserData
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update user data');
                }
            } else {
                if (accountType === 'bank' && (!accountData.accountNumber || !accountData.amount)) return;
                
                if (!showEditAccount && accountType === 'bank') {
                    // Adding new bank account
                    const newAccount = {
                        bank_name: accountData.name,
                        accountNumber: accountData.accountNumber,
                        amount: accountData.amount,
                        source: 'Manual Entry'
                    };
                    
                    const newAccounts = [...bankAccounts, newAccount];
                    setBankAccounts(newAccounts);
                    updatedUserData.bank_accounts = newAccounts;
                    
                    // Update parent state and storage
                    onUpdateUserData(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                    
                    // Close dialog and reset
                    setShowAddAccount(false);
                    setSelectedAccount(null);
                    
                    // Update backend
                    const response = await fetch('http://localhost:8000/api/update-user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nric: userData.personal_info.nric_fin,
                            userData: updatedUserData
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update user data');
                    }
                } else if (accountType === 'bank') {
                    const formattedAccount = {
                        bank_name: accountData.name,
                        accountNumber: accountData.accountNumber,
                        amount: accountData.amount,
                        source: 'Manual Entry'
                    };
                    
                    const updatedAccounts = bankAccounts.map(account =>
                        account.accountNumber === (accountData.originalAccountNumber || accountData.accountNumber)
                            ? formattedAccount 
                            : account
                    );
                    
                    setBankAccounts(updatedAccounts);
                    updatedUserData.bank_accounts = updatedAccounts;
                } else if (!showEditAccount && accountType === 'credit') {
                    // Adding new credit card
                    const newCard = {
                        card_name: accountData.name,
                        accountNumber: accountData.accountNumber,
                        source: 'Manual Entry'
                    };
                    
                    const newCards = [...creditCards, newCard];
                    setCreditCards(newCards);
                    updatedUserData.credit_cards = newCards;
                    
                    // Update parent state and storage
                    onUpdateUserData(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                    
                    // Close dialog and reset
                    setShowAddAccount(false);
                    setSelectedAccount(null);
                    
                    // Update backend
                    const response = await fetch('http://localhost:8000/api/update-user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nric: userData.personal_info.nric_fin,
                            userData: updatedUserData
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update user data');
                    }
                } else if (!showEditAccount && accountType === 'insurance') {
                    // Adding new insurance policy
                    if (!accountData.policyNumber) return;

                    const newInsurance = {
                        insurance_name: accountData.name,
                        policyNumber: accountData.policyNumber,
                        source: 'Manual Entry'
                    };
                    
                    const newInsuranceList = [...insuranceAccounts, newInsurance];
                    setInsuranceAccounts(newInsuranceList);
                    updatedUserData.insurance = newInsuranceList;
                    
                    // Update parent state and storage
                    onUpdateUserData(updatedUserData);
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                    
                    // Close dialog and reset
                    setShowAddAccount(false);
                    setSelectedAccount(null);
                    
                    // Update backend
                    const response = await fetch('http://localhost:8000/api/update-user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nric: userData.personal_info.nric_fin,
                            userData: updatedUserData
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update user data');
                    }
                }
                
                // Update local state and storage
                onUpdateUserData(updatedUserData);
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                
                // Update backend
                const response = await fetch('http://localhost:8000/api/update-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nric: userData.personal_info.nric_fin,
                        userData: updatedUserData
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update user data');
                }
            }
            
            setShowAddAccount(false);
            setShowEditAccount(false);
            setSelectedAccount(null);
            
        } catch (error) {
            console.error('Error updating user data:', error);
            // Optionally show error message to user
        }
    };

    // Update ManageAccessView return handler
    const handleManageAccessReturn = () => {
        setShowManageAccess(false);
        // Status will auto-update due to the useEffect above
    }

    if (showManageAccess) {
        return (
            <ManageAccessView
                userData={userData}
                onUpdateAccess={onUpdateUserData}
                onBack={handleManageAccessReturn}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 py-2 pl-12">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img src="https://file.go.gov.sg/hfpg2025-mylegacylogo.png"
                            alt="My Legacy Vault Logo"
                            className="h-6"/>
                        
                    </div>
                    
                    <nav className="flex gap-6">
                    <div className="flex items-center gap-8 pr-12">
                    <span className="text-sm text-gray-600">Home</span>
                    <span className="text-sm text-gray-600">End-of-life Planning</span>
                    <span className="text-sm text-gray-600">When death happens</span>
                    <span className="text-sm text-gray-600">My Legacy Tools</span>  
                        <Button 
                        variant="outline" 
                        onClick={() => setCurrentView('main')}
                    >
                        Back
                    </Button></div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto mt-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Account Name */}
                    
                    <div className="p-6 pl-12 space-y-4">
                    <img
                            src="https://file.go.gov.sg/hfpg2025-mylegacyvaultlogo.png"
                            alt="My Legacy Vault Logo"
                            className="h-10"
                        />
                        </div>
                    

                    {/* Status Indicators */}
                    <div className="bg-white p-12 rounded-lg shadow-sm space-y-4">

                    

                    <h2 className="text-xl font-bold pb-2">{userData.personal_info.name}'s Vault</h2>
                        
                 

                        {statuses.map((status, index) => (
                            <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6">
                              {status.linked ? (
                                <img
                                  src="https://file.go.gov.sg/hfpg2025-vaulttick.png"
                                  alt="Linked"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <img
                                  src="https://file.go.gov.sg/hfpg2025-vaultredcircle.png"
                                  alt="Not Linked"
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <span className="flex-grow">{status.label}</span>
                            <Button
                              variant="secondary"
                              className="bg-[#3176B5] hover:bg-[#24588D] text-white font-semibold rounded-md w-32"
                              onClick={index === 0 ? handleSGFinDexSetup : () => setShowManageAccess(true)}
                            >
                              {status.buttonText}
                            </Button>
                            </div>
                        ))}
                    </div>
                    {/* Financial Information */}
                    <div className="bg-white p-12 rounded-lg shadow-sm">
                        

                        {/* Bank Accounts Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between  pb-2">
                                <h3 className="text-xl font-bold">Bank Accounts</h3>
                                
                            </div>

                            <div className="space-y-3">
                                {bankAccounts.map((account, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div>
                                            <div className="font-medium">{account.bank_name}</div>
                                            <div className="text-sm text-gray-500">Account Number: {account.accountNumber}</div>
                                            <div className="text-sm text-gray-500">Amount: ${account.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </div>
                                        <div className="text-right">
                                        <div className="text-sm text-gray-500">
  {account.source !== "Retrieved from SGFinDex" && (
    <Button
      variant="ghost"
      className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
      onClick={() =>
        handleEditAccount(
          {
            name: account.bank_name,
            accountNumber: account.accountNumber,
            amount: account.amount,
            source: account.source,
            policyNumber: undefined,
            originalAccountNumber: account.accountNumber,
          },
          'bank'
        )
      }
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit
    </Button>
  )}
  {account.source === "Retrieved from SGFinDex" && (
    <span>Retrieved from SGFinDex</span>
  )}
</div>
                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
<br></br>
                            <Button
                                    variant="ghost"
                                    className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
                                    onClick={() => handleAddAccount('bank')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Account
                                </Button>

                        </div>

                        <hr class="mt-16 border-t-1 border-gray-500" />

                        {/* Credit Card Accounts Section */}
                        <div className="mt-10 space-y-4 pt-4">
                            <div className="flex items-center justify-between pb-2">
                                <h3 className="text-xl font-bold">Credit Cards</h3>
                                
                            </div>
                            <div className="space-y-3">
                                {creditCards.map((card, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div>
                                            <div className="font-medium">{card.card_name}</div>
                                            <div className="text-sm text-gray-500">Credit Card</div>
                                        </div>
                                        <div className="text-right">
                                        <div className="text-sm text-gray-500">
                                        
                                            
                                            {card.source !== "Retrieved from SGFinDex" && (
    <Button
      variant="ghost"
      className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
      onClick={() => handleEditAccount({
        name: card.card_name,
        accountNumber: card.accountNumber,
        amount: undefined,
        source: card.source,
        policyNumber: undefined,
        originalAccountNumber: card.accountNumber
          },
          'credit'
        )
      }
    >

      <Pencil className="w-4 h-4 mr-2" />
      Edit
    </Button>
  )}
  {card.source === "Retrieved from SGFinDex" && (
    <span>Retrieved from SGFinDex</span>
  )}
</div>
</div>
                                    </div>
                                ))}
                            </div>
                            <br></br>
                            <Button
                                    variant="ghost"
                                    className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
                                    onClick={() => handleAddAccount('credit')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Credit Card
                                </Button>
                                
                        </div>

                        <hr class="mt-16 border-t-1 border-gray-500" />

                        {/* Insurance Section */}
                        <div className="mt-10 space-y-4 pt-4">
                            <div className="flex items-center justify-between  pb-2">
                                <h3 className="text-xl font-bold">Insurance Policies</h3>
                                
                            </div>
                            <div className="space-y-3">
                                {insuranceAccounts.map((insurance, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div>
                                            <div className="font-medium">{insurance.insurance_name}</div>
                                            <div className="text-sm text-gray-500">Policy Number: {insurance.policyNumber}</div>
                                        </div>

                                        <div className="text-right">
                                        <div className="text-sm text-gray-500">
  {insurance.source !== "Retrieved from SGFinDex" && (
    <Button
      variant="ghost"
      className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
      onClick={() => handleEditAccount({
        name: insurance.insurance_name,
        accountNumber: undefined,
        amount: undefined,
        source: insurance.source,
        policyNumber: insurance.policyNumber,
        originalAccountNumber: insurance.policyNumber,
          },
          'insurance'
        )
      }
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit
    </Button>
  )}
  {insurance.source === "Retrieved from SGFinDex" && (
    <span>Retrieved from SGFinDex</span>
  )}
</div>
                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
                            </div>
                                       
<br></br><br></br>
                        <Button
                                    variant="ghost"
                                    className="text-blue-600 hover:text-green-600 bg-transparent hover:bg-transparent p-0 min-w-0 h-auto flex items-center"
                                    onClick={() => handleAddAccount('insurance')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Policy
                                </Button>
                    </div>
                </motion.div>

                <div className="p-6 space-y-4">
                    <br></br>
                    <br></br>
                        </div>
            </main>

            {/* SGFinDex Setup Dialog */}
            <Dialog open={showSGFinDexSetup} onOpenChange={setShowSGFinDexSetup}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#3176B5] text-white flex items-center justify-center font-medium">
                                    1
                                </div>
                                <div className="w-16 h-[2px]">
                                    <div className="w-full h-full bg-gray-200"></div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                                    2
                                </div>
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="text-xs font-medium text-gray-500">Step 1:</div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-800">
                                SGFinDex links your data across banks, insurers, MyInfo, and SGX CDP.
                                                            To enable My Legacy Vault to retrieve information from SGFinDex,
                                ensure you connect your accounts to SGFinDex first.
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 py-4 flex justify-center">
    <Button
        className="bg-[#3176B5] hover:bg-[#24588D] text-white mt-0 mb-0"
        onClick={handleConnectAccounts}
    >
        Connect your accounts to SGFinDex
    </Button>
    </div>
    <div className="flex justify-center">


                        <div className="flex items-center justify-center space-x-2 mt-4">
    <Checkbox
        id="connected"
        checked={isConnected}
        onCheckedChange={(checked) => setIsConnected(checked as boolean)}
        className="w-5 h-5" // Optional: Adjust the size of the checkbox as needed
    />
    
    <label
        htmlFor="connected"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
        I have connected my accounts.
    </label>
</div></div>
<div className="flex justify-center">

                        <Button
                            className={`w-full ${isConnected
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                } disabled:opacity-50`}
                            disabled={!isConnected}
                            onClick={handleProceed}
                        >
                            Proceed
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bank Selection Dialog */}
            <BankSelectionDialog
                open={showBankSelection}
                onOpenChange={setShowBankSelection}
                onComplete={handleBankSelectionComplete}
            />

            {/* SGFinDex Agreement Dialog */}
            <SGFinDexAgreement
                open={showAgreement}
                onOpenChange={setShowAgreement}
                onAgree={handleAgree}
                onDecline={handleDecline}
            />

            {/* Add/Edit Account Dialog */}
            <AddEditAccountDialog 
                open={showAddAccount || showEditAccount}
                onOpenChange={(open) => {
                    setShowAddAccount(false);
                    setShowEditAccount(false);
                }}
                accountType={accountType}
                accountData={selectedAccount}
                onSave={handleSaveAccount}
                isEditing={showEditAccount} // Pass the isEditing prop
            />
        </div>
    )
}