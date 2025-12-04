from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

# ---------------------------
# 1️⃣ FastAPI setup
# ---------------------------
app = FastAPI(title="Plant Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# 2️⃣ Load Keras model (.h5)
# ---------------------------
print("Loading model...")
model = tf.keras.models.load_model("saved_model/plant_disease_model.h5")
print("Model loaded successfully.")

# Load class labels
labels = {}
with open("labels.txt", "r") as f:
    for idx, line in enumerate(f):
        labels[idx] = line.strip()

# ---------------------------
# 3️⃣ Image preprocessing
# ---------------------------
IMAGE_SIZE = (224, 224)

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMAGE_SIZE)
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# ---------------------------
# 4️⃣ Health check endpoint
# ---------------------------
@app.get("/")
def health_check():
    return {"status": "ML Server Running"}

# ---------------------------
# 5️⃣ Prediction endpoint with crop filtering
# ---------------------------
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form(...)
):
    """
    crop = user selected crop (apple, potato, corn...)
    """

    try:
        # Read image
        image_bytes = await file.read()
        img_array = preprocess_image(image_bytes)

        # Model prediction
        predictions = model.predict(img_array)[0]

        # ---------------------------
        # Filter classes by crop name
        # ---------------------------
        crop = crop.lower().strip()

        filtered_indices = [
            idx for idx, name in labels.items()
            if name.lower().startswith(crop)
        ]

        if not filtered_indices:
            return {
                "success": False,
                "error": f"No matching classes found for crop '{crop}'."
            }

        # Filter predictions
        filtered_scores = predictions[filtered_indices]

        # Best class among selected crop
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
        return {
            "success": False,
            "error": str(e)
        }

# ---------------------------
# 6️⃣ Run server
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
