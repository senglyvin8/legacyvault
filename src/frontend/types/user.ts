export interface PersonalInfo {
    nric_fin: string;
    name: string;
    deceased: boolean;
    sgfindex_status: boolean;
}

export interface VaultAccess {
    nric_fin: string;
}

export interface BankAccount {
    bank_name: string;
    accountNumber?: string;
    amount: number | undefined;
    source: string;
}

export interface CreditCard {
    card_name: string;
    accountNumber?: string;
    source: string;
}

export interface Insurance {
    insurance_name: string;
    policyNumber?: string;
    source: string;
}

export interface UserData {
    personal_info: PersonalInfo;
    vault_access: VaultAccess[];
    bank_accounts: BankAccount[];
    credit_cards: CreditCard[];
    insurance: Insurance[];
} 