'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface SGFinDexAgreementProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAgree: () => void
    onDecline: () => void
}

export function SGFinDexAgreement({ open, onOpenChange, onAgree, onDecline }: SGFinDexAgreementProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-600 max-h-[90vh] overflow-y-auto mt-=10 mb-10" >
                
            <DialogHeader>
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#3176B5] text-white flex items-center justify-center font-medium">
                                    1
                                </div>
                                <div className="w-16 h-[2px]">
                                    <div className="w-full h-full bg-[#3176B5]"></div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#3176B5] text-white flex items-center justify-center font-medium">
                                    2
                                </div>
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="text-xs font-medium text-gray-500">Step 2:</div>
                        </div>

                        <div className="flex justify-center mt-2 mb-0">
                        <img 
                            src="https://file.go.gov.sg/hfpg2025-vaultsgfindex.png" 
                            alt="SGFinDex" 
                            className="h-10 mt-2"
                        />
                    </div>
                        <div className="text-center space-y-2">
                            <b>Data sharing agreement</b>
                            <p className="text-sm text-gray-800">
                            This participating application/website is requesting the following information for the purposes of legacy planning, from: (i) your selected linked financial institution(s) (being the data source); and (ii) your Profile Data.
                            
                            </p>
                        </div>
                    
                    
                </DialogHeader>

                <div className="space-y-6 text-sm">
                    

                    <div className="py-0">
                    <hr className="border-t-1 border-gray-300 my-4" />
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                            <h3 className="font-semibold mb-2">Government Information</h3>
                                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                                    <li>Notice of Assessment</li>
                                    <li>CPF Account Balance</li>
                                    <li>HDB Ownership</li>
                                    
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Financial Information</h3>
                                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                                    <li>Current and savings accounts</li>
                                    <li>Fixed Deposits</li>
                                    <li>Credit Cards</li>
                                    <li>Insurance Polices</li>
                                </ul>
                            </div>
                        </div>

                        <hr className="border-t-1 border-gray-300 my-4" />

                        <p className="text-sm text-gray-800 mt-2">
                            
                            By clicking "1 agree", vou are authorising 1) the retrieval of the intormation listed above trom your selected linked financial institution(s), based on the SGFinDex Terms of Use; and ii) sharing your Profile Data with Singpass to your selected recipient, based on the Singpass Terms of Use (in particular, Annex 2).
                            </p>

                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={onAgree}
                        >
                            I Agree
                        </Button>
                        <Button 
                            variant="outline"
                            className="w-full"
                            onClick={onDecline}
                        >
                            No Thanks
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}