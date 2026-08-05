"""
MedAI Ghana - Training Data Preparation Script
=================================================
Takes the raw public dataset (4,920 rows, 41 diseases, 132 symptoms)
and produces a clean training file matching MedAI Ghana's real
symptoms table: 480 rows, 4 diseases, 25 symptoms.
"""

import pandas as pd

# -----------------------------------------------------------
# Step 1: Load the raw dataset and clean it up
# -----------------------------------------------------------
df = pd.read_csv('training_data.csv')

# The column headers have accidental leading/trailing spaces in the
# raw file - strip them so "prognosis " and "prognosis" aren't
# treated as two different columns
df.columns = [c.strip() for c in df.columns]

# The raw CSV has a trailing comma on every line, which pandas reads
# as an extra empty column - drop it
if 'Unnamed: 133' in df.columns:
    df = df.drop(columns=['Unnamed: 133'])

# Some disease names also have trailing spaces (e.g. "Diabetes ")
df['prognosis'] = df['prognosis'].str.strip()

print(f"Raw dataset loaded: {len(df)} rows, {df['prognosis'].nunique()} diseases")

# -----------------------------------------------------------
# Step 2: Keep only the 4 diseases we're targeting
# -----------------------------------------------------------
# Hypertension is excluded on purpose - it's diagnosed by blood
# pressure measurement, not symptoms, and is handled by a separate
# rule in the main application instead of this trained model.
TARGET_DISEASES = ['Malaria', 'Typhoid', 'Pneumonia', 'Diabetes']

filtered = df[df['prognosis'].isin(TARGET_DISEASES)].copy()

print(f"Filtered to target diseases: {len(filtered)} rows")
print(filtered['prognosis'].value_counts())

# -----------------------------------------------------------
# Step 3: Map the dataset's symptom column names onto MedAI
# Ghana's real 25 symptoms (from the symptoms table)
# -----------------------------------------------------------
# Left side = your app's real symptom name
# Right side = the matching column name in the raw dataset
# (None = no genuine match exists in this dataset; that symptom
# will simply be 0 for all rows here, which is fine)
SYMPTOM_MAP = {
    'Fever': 'high_fever',
    'Headache': 'headache',
    'Cough': 'cough',
    'Chest Pain': 'chest_pain',
    'Vomiting': 'vomiting',
    'Diarrhoea': 'diarrhoea',
    'Body Weakness': None,
    'Loss of Appetite': 'loss_of_appetite',
    'Fatigue': 'fatigue',
    'Difficulty Breathing': 'breathlessness',
    'Joint Pain': 'joint_pain',
    'Abdominal Pain': 'abdominal_pain',
    'Sore Throat': None,
    'Runny Nose': 'runny_nose',
    'Night Sweats': 'sweating',
    'Excessive Thirst': None,
    'Frequent Urination': 'polyuria',
    'Chills': 'chills',
    'Nausea': 'nausea',
    'Muscle Pain': 'muscle_pain',
    'Constipation': 'constipation',
    'Phlegm': 'phlegm',
    'Excessive Hunger': 'excessive_hunger',
    'Weight Loss': 'weight_loss',
    'Blurred Vision': 'blurred_and_distorted_vision',
}

result = pd.DataFrame()

for app_symptom, dataset_col in SYMPTOM_MAP.items():

    if dataset_col and dataset_col in filtered.columns:
        result[app_symptom] = filtered[dataset_col].values
    else:
        # No match in the dataset for this symptom - fill with 0
        result[app_symptom] = 0

result['disease'] = filtered['prognosis'].values

# -----------------------------------------------------------
# Step 4: Save the cleaned, mapped training data
# -----------------------------------------------------------
result.to_csv('mapped_training_data.csv', index=False)

print(f"\nSaved mapped_training_data.csv: {result.shape[0]} rows, {result.shape[1]-1} symptom columns")
print("\nColumn presence check (how often each symptom appears across all rows):")
print(result.drop(columns=['disease']).sum().sort_values(ascending=False))