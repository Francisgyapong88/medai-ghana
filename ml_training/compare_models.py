"""
MedAI Ghana - Model Comparison Script
=========================================================
Trains and evaluates three different classification algorithms on
the same data and the same train/test split, so their performance
can be fairly compared before choosing which one to deploy.
"""

import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# -----------------------------------------------------------
# Step 1: Load the data (same as train_model.py)
# -----------------------------------------------------------
df = pd.read_csv('mapped_training_data.csv')

FEATURE_COLUMNS = [c for c in df.columns if c != 'disease']
X = df[FEATURE_COLUMNS]
y = df['disease']

# -----------------------------------------------------------
# Step 2: Same train/test split for every model, so the
# comparison is fair - each model sees exactly the same
# training data and is tested on exactly the same unseen data
# -----------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -----------------------------------------------------------
# Step 3: Define the three models to compare
# -----------------------------------------------------------
models = {

    "Logistic Regression": LogisticRegression(
        max_iter=1000,
        random_state=42
    ),

    "Decision Tree": DecisionTreeClassifier(
        max_depth=10,
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    ),

}

# -----------------------------------------------------------
# Step 4: Train and evaluate each model the same way
# -----------------------------------------------------------
results = []

for name, model in models.items():

    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")

    # Train
    model.fit(X_train, y_train)

    # Test on the held-out test set
    predictions = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, predictions)

    # 5-fold cross-validation - trains/tests 5 times on different
    # slices of the full dataset, to check the result isn't just a
    # lucky single split
    cv_scores = cross_val_score(model, X, y, cv=5)

    print(f"Test set accuracy:        {test_accuracy*100:.1f}%")
    print(f"5-fold CV mean accuracy:  {cv_scores.mean()*100:.1f}%")
    print(f"5-fold CV std deviation:  {cv_scores.std()*100:.2f}%")
    print()
    print("Per-disease performance:")
    print(classification_report(y_test, predictions))

    results.append({
        "Model": name,
        "Test Accuracy": f"{test_accuracy*100:.1f}%",
        "CV Mean Accuracy": f"{cv_scores.mean()*100:.1f}%",
        "CV Std Dev": f"{cv_scores.std()*100:.2f}%",
    })

# -----------------------------------------------------------
# Step 5: Print a clean summary table comparing all three
# -----------------------------------------------------------
print(f"\n{'='*60}")
print("  SUMMARY COMPARISON")
print(f"{'='*60}")
summary_df = pd.DataFrame(results)
print(summary_df.to_string(index=False))