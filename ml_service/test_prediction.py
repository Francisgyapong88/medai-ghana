"""
Quick direct test - loads the model file currently sitting in this
folder and asks it about a specific symptom combination, bypassing
Flask and Node entirely, to confirm exactly what this model produces.
"""

import joblib
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

model = joblib.load('disease_prediction_model.pkl')
feature_columns = joblib.load('feature_columns.pkl')

symptoms = ["Fever", "Chills", "Headache", "Muscle Pain", "Vomiting", "Nausea", "Diarrhoea"]

vector = [1 if col in symptoms else 0 for col in feature_columns]
df_input = pd.DataFrame([vector], columns=feature_columns)

probs = model.predict_proba(df_input)[0]
classes = model.classes_

results = sorted(zip(classes, probs), key=lambda x: -x[1])

print("Symptoms tested:", symptoms)
print()
for disease, prob in results:
    if prob > 0.01:
        print(f"  {disease:12s} {prob*100:.1f}%")