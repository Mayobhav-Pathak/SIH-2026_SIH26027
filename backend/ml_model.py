import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

def generate_synthetic_training_data(n_samples=5000):
    np.random.seed(42)
    defect_severity = np.random.randint(1, 6, n_samples)
    days_overdue = np.random.exponential(scale=5, size=n_samples).astype(int)
    traffic_density = np.random.uniform(10, 80, n_samples)
    asset_age = np.random.uniform(1, 25, n_samples)

    criticality = (
        0.35 * defect_severity * 2.0 +
        0.30 * np.minimum(days_overdue * 0.8, 10.0) +
        0.20 * (traffic_density / 8.0) +
        0.15 * (asset_age / 2.5) +
        np.random.normal(0, 0.2, n_samples)
    )
    criticality = np.clip(criticality, 1.0, 10.0)

    df = pd.DataFrame({
        'defect_severity': defect_severity,
        'days_overdue': days_overdue,
        'traffic_density_gmt': traffic_density,
        'asset_age_years': asset_age,
        'criticality_score': criticality
    })
    return df

def train_and_export_model():
    df = generate_synthetic_training_data()
    X = df[['defect_severity', 'days_overdue', 'traffic_density_gmt', 'asset_age_years']]
    y = df['criticality_score']

    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, "railway_criticality_model.pkl")
    print("Model trained and saved to railway_criticality_model.pkl")

if __name__ == "__main__":
    train_and_export_model()