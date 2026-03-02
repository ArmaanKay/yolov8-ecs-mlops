import os 
from io import BytesIO

from PIL import Image
from ultralytics import YOLO

MODEL_PATH = os.getenv("MODEL_PATH", "app/backend/models/yolov8n.pt")
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.25"))
IMG_SIZE = int(os.getenv("IMG_SIZE", "640"))

model = YOLO(MODEL_PATH)


def predict_image(image_bytes: bytes) -> dict:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    results = model.predict(
        source=image,
        conf=CONF_THRESHOLD,
        imgsz=IMG_SIZE,
        verbose=False
    )

    result = results[0]

    detections = []
    for box in result.boxes:
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        x1, y1, x2, y2, = box.xyxy[0].tolist()

        detections.append(
            {
                "label": result.names[class_id],
                "confidence": round(confidence, 4),
                "bbox": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)],
            }
        )

    return  {
        "image": {
            "width": image.width,
            "height": image.height, 
        },
        "detections": detections,
    }