'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface AddEditAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (accountData: AccountData) => void
    accountType: 'bank' | 'credit' | 'insurance'
    accountData?: AccountData | null
    isEditing?: boolean
}

export interface AccountData {
    name: string
    accountNumber?: string
    amount?: number
    source: string
    policyNumber?: string
    originalAccountNumber?: string
}

export function AddEditAccountDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    accountType,
    accountData,
    isEditing = false 
}: AddEditAccountDialogProps) {
    const [formData, setFormData] = useState<AccountData>(accountData || {
        name: '',
        accountNumber: '',
        amount: accountType === 'bank' ? 0 : undefined,
        source: 'Manual Entry'
    })

    useEffect(() => {
        if (accountData) {
            setFormData({
                ...accountData,
                originalAccountNumber: accountData.accountNumber || accountData.policyNumber
            });
        } else {
            setFormData({
                name: '',
                accountNumber: '',
                amount: accountType === 'bank' ? 0 : undefined,
                source: 'Manual Entry'
            });
        }
    }, [accountData, accountType]);

    const handleSave = () => {
        onSave(formData)
        onOpenChange(false)
    }

    const getInputFields = () => {
        switch(accountType) {
            case 'bank':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bank Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter bank name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Account Number</label>
                            <Input
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Enter account number"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                    </>
                )
            case 'credit':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Credit Card Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter credit card name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Card Number</label>
                            <Input
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Enter card number"
                                required
                            />
                        </div>
                    </>
                )
            case 'insurance':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Policy Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter policy name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Policy Number</label>
                            <Input
                                value={formData.policyNumber}
                                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                                placeholder="Enter policy number"
                                required
                            />
                        </div>
                    </>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {getInputFields()}
                    <Button 
                        className="w-full bg-[#3176B5] hover:bg-[#24588D] text-white mt-4"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}