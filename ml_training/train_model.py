"""
MedAI Ghana - Disease Prediction Model Training Script
=========================================================
Trains the final Random Forest classifier (chosen after comparing
against Logistic Regression and Decision Tree - see
compare_models.py) to predict one of 4 diseases (Malaria, Typhoid,
Pneumonia, Diabetes) from 25 symptom inputs, matching the real
symptoms table in the MedAI Ghana database.

Hypertension is intentionally excluded - it is diagnosed by blood
pressure measurement (a vital sign), not by symptom presentation,
and is handled separately by a rule-based check in the main system.
"""

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# -----------------------------------------------------------
# Step 1: Load the prepared dataset
# -----------------------------------------------------------
df = pd.read_csv('mapped_training_data.csv')

# The exact order of these 25 columns matters - the Flask service
# needs to send features in this exact same order at prediction
# time, so we save this list alongside the model.
FEATURE_COLUMNS = [c for c in df.columns if c != 'disease']

X = df[FEATURE_COLUMNS]
y = df['disease']

print(f"Loaded {len(df)} rows, {len(FEATURE_COLUMNS)} features, {y.nunique()} disease classes.")

# -----------------------------------------------------------
# Step 2: Train / test split (80/20, stratified)
# -----------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training rows: {len(X_train)}  |  Test rows: {len(X_test)}")

# -----------------------------------------------------------
# Step 3: Train the Random Forest
# -----------------------------------------------------------
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)

print("Model trained.")

# -----------------------------------------------------------
# Step 4: Evaluate on the held-out test set
# -----------------------------------------------------------
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nTest Accuracy: {accuracy * 100:.1f}%\n")
print(classification_report(y_test, predictions))

labels = sorted(y.unique())
cm = confusion_matrix(y_test, predictions, labels=labels)
print("Confusion Matrix:")
print(pd.DataFrame(cm, index=labels, columns=labels))

# -----------------------------------------------------------
# Step 5: Feature importance (which symptoms mattered most overall)
# -----------------------------------------------------------
importances = pd.Series(model.feature_importances_, index=FEATURE_COLUMNS)
importances = importances.sort_values(ascending=False)

print("\nTop 10 Most Important Symptoms (across all diseases):")
print(importances.head(10))

# -----------------------------------------------------------
# Step 6: Save the trained model to disk
# -----------------------------------------------------------
joblib.dump(model, 'disease_prediction_model.pkl')

# Also save the exact feature column order - the Flask service
# needs this to build input vectors in the same order every time
joblib.dump(FEATURE_COLUMNS, 'feature_columns.pkl')

print("\nModel saved to disease_prediction_model.pkl")
print("Feature column order saved to feature_columns.pkl")