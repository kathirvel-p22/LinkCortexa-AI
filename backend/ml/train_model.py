#!/usr/bin/env python3
"""
LinkCortexa AI - ML Model Trainer
Train a phishing URL detection model using free public datasets

Usage: python train_model.py
"""

import re
import json
import pickle
import urllib.parse
from datetime import datetime

try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import classification_report, accuracy_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    SKLEARN_AVAILABLE = True
    print("✅ scikit-learn available")
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not installed. Run: pip install scikit-learn pandas numpy")

SUSPICIOUS_KEYWORDS = [
    'login','verify','secure','update','confirm','bank','paypal','account',
    'password','signin','credential','suspended','unusual','activity','validate',
    'click','free','prize','winner','urgent','alert','security','billing'
]

SUSPICIOUS_TLDS = [
    '.xyz','.tk','.ml','.ga','.cf','.click','.top','.work','.date',
    '.loan','.review','.men','.download','.racing','.party','.trade'
]

def extract_features(url):
    """Extract ML features from a URL"""
    try:
        parsed = urllib.parse.urlparse(url if url.startswith('http') else f'https://{url}')
        domain = parsed.netloc or parsed.path
        url_lower = url.lower()
        
        features = {
            'url_length': len(url),
            'domain_length': len(domain),
            'has_ip': 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain) else 0,
            'num_dots': url.count('.'),
            'num_hyphens': url.count('-'),
            'num_at': url.count('@'),
            'num_question': url.count('?'),
            'num_ampersand': url.count('&'),
            'num_slash': url.count('/'),
            'num_digits': sum(c.isdigit() for c in url),
            'has_https': 1 if parsed.scheme == 'https' else 0,
            'subdomain_count': max(0, len(domain.split('.')) - 2),
            'has_suspicious_keywords': 1 if any(kw in url_lower for kw in SUSPICIOUS_KEYWORDS) else 0,
            'path_length': len(parsed.path),
            'has_port': 1 if parsed.port else 0,
            'hex_chars': len(re.findall(r'%[0-9a-f]{2}', url_lower)),
            'tld_suspicious': 1 if any(domain.endswith(t) for t in SUSPICIOUS_TLDS) else 0,
            'double_slash_in_path': 1 if '//' in parsed.path else 0,
            'has_fragment': 1 if parsed.fragment else 0,
            'query_length': len(parsed.query),
            'num_params': len(parsed.query.split('&')) if parsed.query else 0
        }
        return features
    except:
        return None

def create_synthetic_dataset(n=5000):
    """Create synthetic training data for demonstration"""
    import random
    
    legit_domains = ['google.com','github.com','stackoverflow.com','amazon.com','microsoft.com',
                     'linkedin.com','twitter.com','facebook.com','apple.com','netflix.com',
                     'youtube.com','reddit.com','wikipedia.org','npmjs.com','pypi.org']
    
    phishing_patterns = [
        'paypal-secure-login-{}.xyz', 'amazon-{}-verify.tk', 'banking-update-{}.ml',
        'secure-{}-login.cf', 'account-verify-{}.click', 'google-{}.work',
        'microsoft-{}.date', 'apple-id-{}-verify.top'
    ]
    
    data = []
    
    # Legitimate URLs (label=0)
    for _ in range(n // 2):
        domain = random.choice(legit_domains)
        paths = ['/', '/about', '/products', '/login', '/api/v1/users', '/blog/post-123']
        url = f'https://{domain}{random.choice(paths)}'
        feat = extract_features(url)
        if feat:
            feat['label'] = 0
            data.append(feat)
    
    # Phishing URLs (label=1)
    for _ in range(n // 2):
        pattern = random.choice(phishing_patterns)
        rand_id = random.randint(1000, 9999)
        domain = pattern.format(rand_id)
        paths = ['/login', '/verify', '/secure/account', '/update-password', '/signin']
        suspicious_params = ['token=abc123', 'session=xyz', 'user=admin&pass=test']
        url = f'http://{domain}{random.choice(paths)}?{random.choice(suspicious_params)}'
        feat = extract_features(url)
        if feat:
            feat['label'] = 1
            data.append(feat)
    
    return data

if __name__ == '__main__':
    if not SKLEARN_AVAILABLE:
        print("Install requirements: pip install scikit-learn pandas numpy")
        exit(1)
    
    print("🤖 LinkCortexa AI — ML Model Training")
    print("=" * 50)
    
    # Create dataset
    print("📊 Generating training dataset...")
    data = create_synthetic_dataset(10000)
    df = pd.DataFrame(data)
    
    # Features and labels
    feature_cols = [c for c in df.columns if c != 'label']
    X = df[feature_cols].fillna(0)
    y = df['label']
    
    print(f"Dataset: {len(df)} samples | Features: {len(feature_cols)}")
    print(f"Phishing: {y.sum()} | Legitimate: {(y==0).sum()}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train models
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': Pipeline([('scaler', StandardScaler()), ('clf', LogisticRegression(random_state=42, max_iter=1000))])
    }
    
    best_model = None
    best_score = 0
    
    for name, model in models.items():
        print(f"\n🔄 Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"   Accuracy: {acc*100:.1f}%")
        print(f"   Report:\n{classification_report(y_test, y_pred, target_names=['Legitimate','Phishing'], indent=4)}")
        
        if acc > best_score:
            best_score = acc
            best_model = (name, model)
    
    print(f"\n✅ Best Model: {best_model[0]} ({best_score*100:.1f}%)")
    
    # Save best model
    model_data = {
        'model': best_model[1],
        'feature_cols': feature_cols,
        'model_name': best_model[0],
        'accuracy': best_score,
        'trained_at': datetime.now().isoformat()
    }
    
    with open('phishing_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print("💾 Model saved: phishing_model.pkl")
    print("\n🚀 Model is ready to use in the backend!")
    print("The Node.js backend uses a rule-based version of the same logic.")
    print("You can extend it to call this Python model via a REST endpoint.")
