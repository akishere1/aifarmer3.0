from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

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

# Prediction input model
class PredictionInput(BaseModel):
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    water_level: float
    soil_type: int  # Numeric soil type value
    land_area: float
    location: str
    season: int  # Numeric season value

# Sample prediction endpoint
@app.post("/predict")
async def predict_crop(input_data: PredictionInput):
    try:
        # Here you would typically call your ML model
        # For demonstration, we're returning a sample response
        
        # Convert input soil_type and season to appropriate values if needed
        # Based on your ML model requirements
        
        # Example response with prediction
        return {
            "prediction": "Rice",
            "confidence": 0.85
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run the server if executed directly
if __name__ == "__main__":
    uvicorn.run("ml_model_api:app", host="127.0.0.1", port=9000, reload=True) 