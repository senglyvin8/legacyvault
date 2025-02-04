from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .utils.json_reader import get_user_data_from_json, load_available_nrics, update_user_data, get_sgfindex_data, get_deceased_vault_data
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load and verify NRIC data on startup
@app.on_event("startup")
async def startup_event():
    try:
        nrics = load_available_nrics()
        logger.info(f"Available NRICs in database: {nrics}")
    except Exception as e:
        logger.error(f"Failed to load database: {e}")
        raise e

class LoginRequest(BaseModel):
    nric: str

@app.post("/api/login")
async def login(request: LoginRequest):
    user_data = get_user_data_from_json(request.nric)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data

class UpdateUserRequest(BaseModel):
    nric: str
    userData: dict

@app.post("/api/update-user")
async def update_user(request: UpdateUserRequest):
    try:
        success = update_user_data(request.nric, request.userData)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sgfindex-data/{nric}")
async def get_sgfindex_user_data(nric: str):
    try:
        sgfindex_data = get_sgfindex_data(nric)
        return sgfindex_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/deceased-vault/{deceased_nric}")
async def get_deceased_vault(deceased_nric: str, requester_nric: str):
    try:
        logger.info(f"Deceased vault access request - Requester: {requester_nric}, Target: {deceased_nric}")
        vault_data = get_deceased_vault_data(requester_nric, deceased_nric)
        logger.info(f"Successfully retrieved vault data for {deceased_nric}")
        return vault_data
    except Exception as e:
        logger.error(f"Failed to retrieve vault data: {str(e)}")
        raise HTTPException(status_code=403, detail=str(e))

@app.get("/api/check-access/{deceased_nric}")
async def check_vault_access(deceased_nric: str, requester_nric: str):
    try:
        # Get user data
        user_data = get_user_data_from_json(deceased_nric)
        if not user_data:
            return {
                "status": "not_found",
                "message": "NRIC does not match any records"
            }
            
        name = user_data['personal_info']['name']
        
        # First check if requester has access
        has_access = any(
            access['nric_fin'] == requester_nric 
            for access in user_data['vault_access']
        )
        
        if not has_access:
            return {
                "status": "unauthorized",
                "name": name,
                "message": "No access to this vault"
            }
            
        # If authorized, then check if deceased
        if not user_data['personal_info'].get('deceased', False):
            return {
                "status": "not_deceased",
                "message": "NRIC does not match any death records"
            }
            
        # User is authorized and deceased
        return {
            "status": "authorized",
            "name": name
        }
            
    except Exception as e:
        logger.error(f"Access check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-excel")
async def save_excel(file: UploadFile = File(...)):
    try:
        data_dir = get_db_path() / 'excel'
        data_dir.mkdir(exist_ok=True)
        
        file_path = data_dir / file.filename
        with open(file_path, 'wb') as f:
            content = await file.read()
            f.write(content)
            
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 