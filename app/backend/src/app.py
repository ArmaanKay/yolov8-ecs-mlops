from flask import Flask, jsonify, request
from flask_cors import CORS

from src.model import predict_image 

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health(): 
    return jsonify({"status": "ok"})

@app.post("/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use form field name 'image'."}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "Empty filename provided."}), 400

    try:
        image_bytes = image_file.read()
        prediction = predict_image(image_bytes)
        prediction["image"]["filename"] = image_file.filename
        return jsonify(prediction)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
