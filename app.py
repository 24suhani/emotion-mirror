from flask import Flask, render_template, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np
import base64

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/detect", methods=["POST"])
def detect():
    try:

        data = request.json["image"]

        encoded = data.split(",")[1]

        img_data = base64.b64decode(encoded)

        np_arr = np.frombuffer(img_data, np.uint8)

        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        result = DeepFace.analyze(
            frame,
            actions=["emotion"],
            enforce_detection=False
        )

        if isinstance(result, list):
            result = result[0]

        emotion = str(result["dominant_emotion"])

        confidence = float(
            max(result["emotion"].values())
        )

        return jsonify({
            "emotion": emotion,
            "confidence": round(confidence, 2)
        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "emotion": "No Face",
            "confidence": 0
        })


if __name__ == "__main__":
    app.run(debug=True)