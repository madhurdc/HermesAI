import os
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from career_recommendation_model_clean import (
    load_model, train_model, save_model, predict_top_k, load_data, MODEL_PATH
)

app = Flask(__name__)
CORS(app)

# Global model variable
model = None

def initialize_model():
    global model
    print("Checking for existing ML model...")
    if not MODEL_PATH.exists():
        print("Model not found. Training a new model from dataset...")
        try:
            df = load_data()
            model, accuracy, report = train_model(df)
            save_model(model)
            print(f"Model trained successfully. Test Accuracy: {accuracy:.4f}")
        except Exception as e:
            print(f"Error during model initialization: {e}")
            raise e
    else:
        print("Model found. Loading...")
        model = load_model()
        print("Model loaded successfully.")

with app.app_context():
    initialize_model()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        age = int(data.get('age', 25))
        education = data.get('education', '')
        skills = data.get('skills', '')
        interests = data.get('interests', '')

        # Fallback handling for missing values
        if not age: age = 22
        if not education: education = "unknown"

        top_predictions = predict_top_k(
            age=age,
            education=education,
            skills=skills,
            interests=interests,
            model=model,
            k=5
        )

        # Map to structured output
        recommendations = [
            {"career": career, "score": score} 
            for career, score in top_predictions
        ]

        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on port 5001 to avoid conflicting with Node.js on 5000
    app.run(host='0.0.0.0', port=5001, debug=False)
