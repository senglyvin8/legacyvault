import json
from typing import Dict, List, Optional, Any
from pathlib import Path

def get_db_path() -> Path:
    """Get the path to the database files"""
    backend_dir = Path(__file__).resolve().parent.parent.parent
    data_dir = backend_dir.parent / 'data'
    return data_dir

def read_json_file(file_path: Path) -> Dict:
    """Read a JSON file and return its contents"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {str(e)}")
        raise e

def get_user_data_from_json(nric: str) -> Optional[Dict[str, Any]]:
    """Get user data from MyLegacyDB.json by NRIC"""
    try:
        data_dir = get_db_path()
        mylegacy_path = data_dir / 'MyLegacyDB.json'
        sgfindex_path = data_dir / 'SGFinDexDB.json'

        # Read both databases
        mylegacy_db = read_json_file(mylegacy_path)
        sgfindex_db = read_json_file(sgfindex_path)

        # Find user in MyLegacy DB
        user_data = next(
            (user for user in mylegacy_db['users'] 
             if user['personal_info']['nric_fin'] == nric), 
            None
        )

        if not user_data:
            return None

        # If user has SGFinDex linked, merge SGFinDex data
        if user_data['personal_info']['sgfindex_status']:
            sgfindex_data = next(
                (user for user in sgfindex_db['users'] 
                 if user['personal_info']['nric_fin'] == nric),
                None
            )
            if sgfindex_data:
                # Update financial data with SGFinDex data
                merge_sgfindex_data(user_data, sgfindex_data)

        return user_data

    except Exception as e:
        print(f"Error getting user data from JSON: {str(e)}")
        return None

def merge_sgfindex_data(user_data: Dict, sgfindex_data: Dict):
    """Merge SGFinDex data into user data"""
    # Add source to SGFinDex data
    for account in sgfindex_data.get('bank_accounts', []):
        account['source'] = 'Retrieved from SGFinDex'
    for card in sgfindex_data.get('credit_cards', []):
        card['source'] = 'Retrieved from SGFinDex'
    for policy in sgfindex_data.get('insurance', []):
        policy['source'] = 'Retrieved from SGFinDex'

    # Replace existing SGFinDex-sourced data
    user_data['bank_accounts'] = [
        acc for acc in user_data['bank_accounts'] 
        if acc['source'] != 'Retrieved from SGFinDex'
    ] + sgfindex_data.get('bank_accounts', [])

    user_data['credit_cards'] = [
        card for card in user_data['credit_cards'] 
        if card['source'] != 'Retrieved from SGFinDex'
    ] + sgfindex_data.get('credit_cards', [])

    user_data['insurance'] = [
        ins for ins in user_data['insurance'] 
        if ins['source'] != 'Retrieved from SGFinDex'
    ] + sgfindex_data.get('insurance', [])

def load_available_nrics() -> List[str]:
    """Load all available NRICs from the database"""
    try:
        data_dir = get_db_path()
        mylegacy_path = data_dir / 'MyLegacyDB.json'
        
        mylegacy_db = read_json_file(mylegacy_path)
        return [user['personal_info']['nric_fin'] for user in mylegacy_db['users']]
        
    except Exception as e:
        print(f"Error loading NRICs: {str(e)}")
        raise e 

def update_user_data(nric: str, updated_data: Dict) -> bool:
    """Update user data in MyLegacyDB.json"""
    try:
        data_dir = get_db_path()
        mylegacy_path = data_dir / 'MyLegacyDB.json'
        
        # Read current data
        with open(mylegacy_path, 'r') as f:
            db_data = json.load(f)
        
        # Find and update user
        for i, user in enumerate(db_data['users']):
            if user['personal_info']['nric_fin'] == nric:
                db_data['users'][i] = updated_data
                # Write updated data back to file
                with open(mylegacy_path, 'w') as f:
                    json.dump(db_data, f, indent=2)
                return True
                
        return False
        
    except Exception as e:
        print(f"Error updating user data: {str(e)}")
        raise e 

def get_sgfindex_data(nric: str) -> Dict:
    """Get user's SGFinDex data from SGFinDexDB.json"""
    try:
        data_dir = get_db_path()
        sgfindex_path = data_dir / 'SGFinDexDB.json'
        
        with open(sgfindex_path, 'r') as f:
            db_data = json.load(f)
            
        # Find user data by NRIC
        for user in db_data['users']:
            if user['personal_info']['nric_fin'] == nric:
                return {
                    'bank_accounts': user.get('bank_accounts', []),
                    'credit_cards': user.get('credit_cards', []),
                    'insurance': user.get('insurance', [])
                }
                
        return {
            'bank_accounts': [],
            'credit_cards': [],
            'insurance': []
        }
        
    except Exception as e:
        print(f"Error getting SGFinDex data: {str(e)}")
        raise e 

def get_deceased_vault_data(requester_nric: str, deceased_nric: str) -> Dict:
    """Get deceased person's data if requester has access"""
    try:
        data_dir = get_db_path()
        mylegacy_path = data_dir / 'MyLegacyDB.json'
        
        print(f"\nAttempting to retrieve vault data:")
        print(f"Requester NRIC: {requester_nric}")
        print(f"Deceased NRIC: {deceased_nric}")
        
        with open(mylegacy_path, 'r') as f:
            db_data = json.load(f)
            
        # Find deceased person's data
        for user in db_data['users']:
            if user['personal_info']['nric_fin'] == deceased_nric:
                print(f"\nFound user data for {deceased_nric}:")
                print(f"Name: {user['personal_info']['name']}")
                print(f"Vault access list: {[access['nric_fin'] for access in user['vault_access']]}")
                
                # Check if requester has access
                has_access = any(
                    access['nric_fin'] == requester_nric 
                    for access in user['vault_access']
                )
                
                if has_access:
                    # Format data according to schema
                    vault_data = {
                        'name': user['personal_info']['name'],
                        'insurance': [{
                            'insurance_name': policy['insurance_name'],
                            'policyNumber': policy['policyNumber'],
                            'source': policy['source']
                        } for policy in user['insurance']],
                        'bank_accounts': [{
                            'bank_name': account['bank_name'],
                            'accountNumber': account['accountNumber'],
                            'amount': account['amount'],
                            'source': account['source']
                        } for account in user['bank_accounts']],
                        'credit_cards': [{
                            'card_name': card['card_name'],
                            'accountNumber': card['accountNumber'],
                            'source': card['source']
                        } for card in user['credit_cards']]
                    }
                    
                    print("\nAccess granted. Returning vault data:")
                    print("Insurance policies:", len(vault_data['insurance']))
                    print("Bank accounts:", len(vault_data['bank_accounts']))
                    print("Credit cards:", len(vault_data['credit_cards']))
                    return vault_data
                else:
                    print(f"\nAccess denied: {requester_nric} not in vault access list")
                    raise Exception('No access to this vault')
                    
        print(f"\nUser not found: {deceased_nric}")
        raise Exception('User not found')
        
    except Exception as e:
        print(f"Error getting deceased vault data: {str(e)}")
        raise e 