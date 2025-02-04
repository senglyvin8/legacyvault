import pandas as pd
from typing import Dict, List, Optional, Any
import os
from pathlib import Path

def get_excel_path() -> Path:
    # Get the path to the database file using relative path
    backend_dir = Path(__file__).resolve().parent.parent.parent
    data_dir = backend_dir.parent / 'data'
    excel_path = data_dir / 'demoDB.xlsx'
    
    if not excel_path.exists():
        raise FileNotFoundError(f"Excel file not found at: {excel_path}")
        
    return excel_path

class ExcelReader:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.legacy_data = None

    def read_legacy_data(self) -> Optional[pd.DataFrame]:
        """
        Reads the MyLegacy sheet from the Excel file
        """
        try:
            self.legacy_data = pd.read_excel(self.file_path, sheet_name='MyLegacy')
            return self.legacy_data
        except Exception as e:
            print(f"Error reading Excel file: {str(e)}")
            return None

    def get_user_data(self, nric_fin: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves all data for a specific user by NRIC/FIN
        """
        print(f"Backend - Searching for NRIC/FIN: {nric_fin}")
        
        if self.legacy_data is None:
            self.read_legacy_data()
        
        try:
            user_data = self.legacy_data[self.legacy_data['nric_fin'] == nric_fin]
            if user_data.empty:
                print(f"Backend - No user found for NRIC/FIN: {nric_fin}")
                return None
            
            # Convert the row to a dictionary and clean NaN values
            user_dict = user_data.iloc[0].replace({pd.NA: None, pd.NaT: None}).to_dict()
            
            # Replace NaN with None
            for key in user_dict:
                if pd.isna(user_dict[key]):
                    user_dict[key] = None
            
            # Ensure consistent data structure
            formatted_data = {
                'personal_info': {
                    'nric_fin': str(user_dict.get('nric_fin', '')),
                    'name': str(user_dict.get('name', '')),
                    'deceased_status': str(user_dict.get('deceased_status', '')),
                    'sgfindex_status': str(user_dict.get('sgfindex_status', ''))
                },
                'vault_access': [
                    str(access) for access in [
                        user_dict.get('vault_access_01'),
                        user_dict.get('vault_access_02'),
                        user_dict.get('vault_access_03')
                    ] if access is not None and not pd.isna(access)
                ],
                'bank_accounts': self._extract_bank_accounts(user_dict),
                'credit_cards': self._extract_credit_cards(user_dict),
                'insurance': self._extract_insurance(user_dict)
            }
            
            return formatted_data
            
        except Exception as e:
            print(f"Backend - Error getting user data: {str(e)}")
            return None

    def _extract_bank_accounts(self, user_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts bank account information from user data
        """
        accounts = []
        for i in range(1, 5):  # 4 bank accounts
            idx = str(i).zfill(2)
            name = user_dict.get(f'bank_account_name_{idx}')
            if name and not pd.isna(name):
                accounts.append({
                    'name': str(name),
                    'number': str(user_dict.get(f'bank_account_number_{idx}') or ''),
                    'value': float(user_dict.get(f'bank_account_value_{idx}') or 0),
                    'status': str(user_dict.get(f'bank_account_status_{idx}') or ''),
                    'date': str(user_dict.get(f'bank_account_date_{idx}') or '')
                })
        return accounts

    def _extract_credit_cards(self, user_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts credit card information from user data
        """
        cards = []
        for i in range(1, 5):  # 4 credit cards
            idx = str(i).zfill(2)
            name = user_dict.get(f'credit_card_name_{idx}')
            if name and not pd.isna(name):
                cards.append({
                    'name': str(name),
                    'status': str(user_dict.get(f'credit_card_status_{idx}') or ''),
                    'date': str(user_dict.get(f'credit_card_date_{idx}') or '')
                })
        return cards

    def _extract_insurance(self, user_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts insurance information from user data
        """
        insurance = []
        for i in range(1, 5):  # 4 insurance entries
            idx = str(i).zfill(2)
            name = user_dict.get(f'insurance_name_{idx}')
            if name and not pd.isna(name):
                insurance.append({
                    'name': str(name),
                    'status': str(user_dict.get(f'insurance_status_{idx}') or ''),
                    'date': str(user_dict.get(f'insurance_date_{idx}') or '')
                })
        return insurance

    def get_all_users(self) -> List[Dict[str, Any]]:
        """
        Retrieves basic information for all users
        """
        if self.legacy_data is None:
            self.read_legacy_data()
        
        try:
            users = []
            for _, row in self.legacy_data.iterrows():
                users.append({
                    'nric_fin': row['nric_fin'],
                    'name': row['name'],
                    'deceased_status': row['deceased_status'],
                    'sgfindex_status': row['sgfindex_status']
                })
            return users
        except Exception as e:
            print(f"Error getting all users: {str(e)}")
            return []

def load_available_nrics() -> list[str]:
    try:
        excel_path = get_excel_path()
        print(f"Loading Excel file from: {excel_path}")
        
        # Read the Excel file from MyLegacy sheet
        df = pd.read_excel(str(excel_path), sheet_name='MyLegacy')
        
        # Get all unique NRIC values
        nrics = df['nric_fin'].unique().tolist()
        
        if not nrics:
            raise ValueError("No NRICs found in database")
            
        return nrics
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        raise e

def get_user_data_from_excel(nric: str) -> Optional[Dict[str, Any]]:
    """
    Get user data from Excel file by NRIC
    """
    try:
        excel_path = get_excel_path()
        reader = ExcelReader(str(excel_path))
        return reader.get_user_data(nric)
    except Exception as e:
        print(f"Error getting user data from Excel: {e}")
        return None 