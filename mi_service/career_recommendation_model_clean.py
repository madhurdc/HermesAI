"""
Career Recommendation System
Clean local version for the current dataset:
Age, Education, Skills, Interests, Recommended_Career

Model:
- Logistic Regression
- TF-IDF on combined text features
- OneHotEncoder for Education
- StandardScaler for Age

This script:
1. Trains the model from the CSV dataset
2. Saves the trained pipeline
3. Lets you test your own input from the terminal
"""

from __future__ import annotations

import re
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")

RANDOM_STATE = 42
DATASET_NAME = "career_recommendation_dataset.csv"
MODEL_PATH = Path("career_recommendation_model.joblib")


def resolve_dataset_path() -> Path:
    """Find the CSV file in the current folder, then alongside this script."""
    candidates = [
        Path(DATASET_NAME),
        Path(__file__).resolve().parent / DATASET_NAME,
        Path.cwd() / DATASET_NAME,
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(
        f"Could not find '{DATASET_NAME}'. Put the CSV in the same folder as this script."
    )


def normalize_text(value) -> str:
    """Lowercase text and replace common separators with spaces."""
    if pd.isna(value):
        return ""
    text = str(value).lower()
    text = text.replace(";", " ")
    text = text.replace(",", " ")
    text = text.replace("/", " ")
    text = text.replace("|", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_data() -> pd.DataFrame:
    path = resolve_dataset_path()
    df = pd.read_csv(path)

    required_cols = {"Age", "Education", "Skills", "Interests", "Recommended_Career"}
    missing = required_cols.difference(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing columns: {sorted(missing)}")

    df = df.copy()

    df["Age"] = pd.to_numeric(df["Age"], errors="coerce")
    df["Education"] = df["Education"].fillna("unknown").astype(str).str.strip()
    df["Skills"] = df["Skills"].fillna("").apply(normalize_text)
    df["Interests"] = df["Interests"].fillna("").apply(normalize_text)
    df["Recommended_Career"] = df["Recommended_Career"].fillna("").astype(str).str.strip()

    df["Text_Features"] = (df["Skills"] + " " + df["Interests"]).str.strip()
    return df


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "age",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                ["Age"],
            ),
            (
                "education",
                OneHotEncoder(handle_unknown="ignore"),
                ["Education"],
            ),
            (
                "text",
                TfidfVectorizer(max_features=4000, ngram_range=(1, 2), min_df=2),
                "Text_Features",
            ),
        ],
        remainder="drop",
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                LogisticRegression(
                    max_iter=1000,
                    solver="lbfgs",
                ),
            ),
        ]
    )
    return model


def train_model(df: pd.DataFrame):
    X = df[["Age", "Education", "Text_Features"]]
    y = df["Recommended_Career"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    model = build_pipeline()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, zero_division=0)

    return model, accuracy, report


def save_model(model: Pipeline) -> None:
    joblib.dump(model, MODEL_PATH)


def load_model() -> Pipeline:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file '{MODEL_PATH}' not found. Run the training first."
        )
    return joblib.load(MODEL_PATH)


def predict_top_k(
    age: int,
    education: str,
    skills: str,
    interests: str,
    model: Pipeline | None = None,
    k: int = 3,
):
    if model is None:
        model = load_model()

    sample = pd.DataFrame(
        [
            {
                "Age": age,
                "Education": str(education).strip(),
                "Text_Features": f"{normalize_text(skills)} {normalize_text(interests)}".strip(),
            }
        ]
    )

    probabilities = model.predict_proba(sample)[0]
    top_indices = np.argsort(probabilities)[::-1][:k]

    return [
        (model.classes_[idx], float(probabilities[idx]))
        for idx in top_indices
    ]


def main():
    df = load_data()
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    print("Career labels:", df["Recommended_Career"].nunique())
    print("\nSample rows:")
    print(df[["Age", "Education", "Skills", "Interests", "Recommended_Career"]].head(3).to_string(index=False))

    model, accuracy, report = train_model(df)
    save_model(model)

    print("\nModel trained and saved to:", MODEL_PATH)
    print(f"Test accuracy: {accuracy:.4f}\n")
    print(report)

    print("\n--- Test your own data ---")
    age = int(input("Enter age: ").strip())
    education = input("Enter education (example: Bachelor's, Master's, PhD): ").strip()
    skills = input("Enter skills: ").strip()
    interests = input("Enter interests: ").strip()

    top_predictions = predict_top_k(age, education, skills, interests, model=model, k=3)

    print("\nTop recommendations:")
    for rank, (career, score) in enumerate(top_predictions, start=1):
        print(f"{rank}. {career} -> {score:.2f}")


if __name__ == "__main__":
    main()
