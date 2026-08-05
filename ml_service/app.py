"""
MedAI Ghana - ML Prediction Service
=====================================
A small Flask microservice that loads the trained Random Forest model
and exposes it over HTTP so the main Node.js/Express backend can call
it for real machine-learning-based disease predictions.

This is a completely separate running process from the Node backend -
Node cannot run scikit-learn directly, so this service bridges the gap.

Run with:  python3 app.py
Listens on: http://localhost:5001
"""

from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# -----------------------------------------------------------
# Load the trained model and feature order ONCE, when the
# service starts - not on every request, since loading is slow
# and the model itself never changes while the service is running.
# -----------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'disease_prediction_model.pkl')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'feature_columns.pkl')

model = joblib.load(MODEL_PATH)
FEATURE_COLUMNS = joblib.load(FEATURES_PATH)

print(f"Model loaded successfully. Expecting {len(FEATURE_COLUMNS)} features:")
print(FEATURE_COLUMNS)


@app.route('/health', methods=['GET'])
def health():
    """Simple check to confirm the service is running and the model loaded."""
    return jsonify({
        "status": "ok",
        "model_loaded": True,
        "feature_count": len(FEATURE_COLUMNS)
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Expects JSON body like:
    {
        "symptoms": ["Fever", "Chills", "Muscle Pain", "Headache"]
    }

    Returns ranked predictions with probabilities for all 4 diseases
    the model was trained on.
    """

    try:

        data = request.get_json()

        if not data or 'symptoms' not in data:
            return jsonify({
                "success": False,
                "message": "Request body must include a 'symptoms' array."
            }), 400

        reported_symptoms = set(data['symptoms'])

        # Build the input vector in the EXACT same column order the
        # model was trained on. For every one of the 25 known symptoms,
        # put a 1 if the patient reported it, 0 if not.
        input_vector = [
            1 if symptom in reported_symptoms else 0
            for symptom in FEATURE_COLUMNS
        ]

        # scikit-learn expects a 2D array (a list of rows), even for
        # a single prediction - so we wrap our one row in an outer list
        probabilities = model.predict_proba([input_vector])[0]

        # model.classes_ gives us the disease name matching each
        # probability, in the same order predict_proba returned them
        disease_names = model.classes_

        results = [
            {"disease": disease, "probability": round(float(prob), 4)}
            for disease, prob in zip(disease_names, probabilities)
        ]

        # Sort highest probability first
        results.sort(key=lambda r: r['probability'], reverse=True)

        return jsonify({
            "success": True,
            "predictions": results
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": f"Prediction failed: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
