from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import os

app = FastAPI()

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
model = None

try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print(f"Model not found at {MODEL_PATH}. Using fallback or wait for upload.")
except Exception as e:
    print(f"Error loading model: {e}")

@app.get("/")
async def root():
    return {"message": "Strawbot YOLO11 API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded. Please ensure best.pt is in the models directory."}
    
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Predict
    results = model(image)
    
    # Process results
    predictions = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            b = box.xyxy[0].tolist()  # get box coordinates in (top, left, bottom, right) format
            c = box.cls.item()
            conf = box.conf.item()
            predictions.append({
                "box": b,
                "class": r.names[int(c)],
                "confidence": conf
            })
    
    return {
        "filename": file.filename,
        "predictions": predictions,
        "summary": "Analizado"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
