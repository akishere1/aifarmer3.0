# ML API Setup with CORS

This document explains how to run the ML model APIs with CORS enabled to prevent cross-origin errors with your React app.

## Prerequisites

Make sure you have the following packages installed:

```bash
pip install fastapi uvicorn python-multipart
```

## API Key Authentication

The ML model APIs are secured with API key authentication:

- Crop Prediction API uses key: `aifarm-ml-key`
- Disease Detection API uses key: `aifarm-ml-key`

When making requests to the APIs, include the API key in the header:

```
X-API-Key: aifarm-ml-key
```

## Starting the Crop Prediction API

The crop prediction API runs on port 9000 and handles predictions based on field data.

1. Open a terminal and navigate to the project directory.
2. Run the following command:

```bash
python ml_model_api.py
```

This will start the server at http://127.0.0.1:9000 with the following endpoints:
- POST /predict - For crop predictions (requires API key)
- GET /health - Health check

## Starting the Disease Detection API

The disease detection API runs on port 8000 and handles disease detection from plant images.

1. Open another terminal and navigate to the project directory.
2. Run the following command:

```bash
python disease_detection_api.py
```

This will start the server at http://127.0.0.1:8000 with the following endpoints:
- POST /predict/ - For disease detection (requires API key)
- GET /health - Health check

## Important CORS Settings

Both APIs have CORS enabled with the following settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
```

This configuration allows:
- Requests from any origin (*)
- All HTTP methods (GET, POST, etc.)
- All headers

## Troubleshooting

If you're still experiencing issues:

1. Ensure both APIs are running
2. Check your browser console for specific errors
3. Make sure your React app is sending requests to the correct endpoints
4. Verify that the data format matches what the API expects
5. Ensure the API key is correctly included in the headers
6. Check server logs for authentication errors

In a production environment, you should:
- Replace the wildcard (*) in CORS with specific origins
- Use environment variables for API keys
- Consider using a more robust authentication system 