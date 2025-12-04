import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from dotenv import load_dotenv

# ---------------------------
# 1️⃣ Load .env
# ---------------------------
load_dotenv()

HOST = os.getenv("ML_SERVER_HOST", "0.0.0.0")
PORT = int(os.getenv("ML_SERVER_PORT", 8000))
MODEL_PATH = os.getenv("MODEL_PATH", "saved_model/plant_disease_model.h5")
CLASS_NAMES_PATH = os.getenv("CLASS_NAMES_PATH", "labels.txt")
IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", 224))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# ---------------------------
# 2️⃣ FastAPI setup
# ---------------------------
app = FastAPI(title="Plant Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# 3️⃣ Load Keras model
# ---------------------------
print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully.")

# Load class labels
labels = {}
with open(CLASS_NAMES_PATH, "r") as f:
    for idx, line in enumerate(f):
        labels[idx] = line.strip()

# ---------------------------
# 4️⃣ Image preprocessing
# ---------------------------
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# ---------------------------
# 5️⃣ Health check
# ---------------------------
@app.get("/")
def health_check():
    return {"status": "ML Server Running"}

# ---------------------------
# 6️⃣ Prediction endpoint
# ---------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...), crop: str = Form(...)):
    try:
        image_bytes = await file.read()
        img_array = preprocess_image(image_bytes)
        predictions = model.predict(img_array)[0]

        crop = crop.lower().strip()
        filtered_indices = [idx for idx, name in labels.items() if name.lower().startswith(crop)]

        if not filtered_indices:
            return {"success": False, "error": f"No matching classes found for crop '{crop}'."}

        filtered_scores = predictions[filtered_indices]
        best_local_index = int(np.argmax(filtered_scores))
        best_global_index = filtered_indices[best_local_index]

        predicted_label = labels[best_global_index]
        confidence = float(filtered_scores[best_local_index] * 100)

        return {
            "success": True,
            "selected_crop": crop,
            "predicted_class": predicted_label,
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

# ---------------------------
# 7️⃣ Run server
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
