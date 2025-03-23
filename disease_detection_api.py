from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import Optional

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# API key for authentication
API_KEY = "aifarm-ml-key"

# Dependency to verify API key
async def verify_api_key(x_api_key: str = Header(None, alias="X-API-Key")):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

# Create a static directory if it doesn't exist
os.makedirs("static", exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Disease detection endpoint
@app.post("/predict/")
async def predict_disease(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_content = await file.read()
        file_path = f"static/{file.filename}"
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Here you would typically call your disease detection model
        # For demonstration, we're returning a sample response
        
        return {
            "Predicted Disease": "healthy",
            "Confidence": 0.85,
            "Recommended Pesticide": "None needed - plant is healthy",
            "Pesticide Image": None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Disease detection error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run the server if executed directly
if __name__ == "__main__":
    uvicorn.run("disease_detection_api:app", host="127.0.0.1", port=8000, reload=True) 