# WellTegra Additional Modules - Technical Specifications

**Authors:** Various (see individual sections)
**Version:** 1.0
**Date:** 2025-11-06
**Status:** Consolidated Specification Document

---

## Table of Contents

1. [Data Integrity Score Model Implementation](#1-data-integrity-score-model-implementation)
2. [Data Pipeline Schema for DIS Metadata](#2-data-pipeline-schema-for-dis-metadata)
3. [Mobile Communicator Field Mode](#3-mobile-communicator-field-mode)
4. [Digital Twin Asset Library](#4-digital-twin-asset-library)
5. [Contractual NPT Tracker](#5-contractual-npt-tracker)
6. [NLP Model for Contract Parsing](#6-nlp-model-for-contract-parsing)
7. [Automated Vendor Scorecard](#7-automated-vendor-scorecard)
8. [Vendor Scorecard AI Integration](#8-vendor-scorecard-ai-integration)

---

## 1. Data Integrity Score Model Implementation

**Author:** Dr. Alistair Fraser - Data Scientist & CTO
**Related Document:** `DATA_INTEGRITY_SCORE_FRAMEWORK.md`

### 1.1 Machine Learning Model Architecture

**Model Purpose:** Predict data quality issues before they impact operations and auto-correct common data errors.

**Model Types:**

#### A. Classification Model (Data Quality Prediction)
```python
# Random Forest classifier for predicting data quality issues
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd

class DISQualityPredictor:
    """Predict if a data point is likely to have quality issues"""

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()

    def extract_features(self, data_point: dict) -> pd.DataFrame:
        """Extract features for ML model"""
        features = {
            # Statistical features
            'value': data_point['value'],
            'zscore': self._calculate_zscore(data_point['value'], data_point['historical_values']),
            'rate_of_change': self._calculate_rate_of_change(data_point),

            # Temporal features
            'hour_of_day': data_point['timestamp'].hour,
            'day_of_week': data_point['timestamp'].weekday(),
            'time_since_last_update': self._time_since_last_update(data_point),

            # Source features
            'source_reliability_score': self._get_source_reliability(data_point['source']),
            'manual_entry': 1 if data_point['source'] == 'Manual_Entry' else 0,

            # Contextual features
            'well_age_days': self._get_well_age(data_point['well_id']),
            'recent_intervention': 1 if self._had_recent_intervention(data_point['well_id']) else 0
        }

        return pd.DataFrame([features])

    def predict_quality(self, data_point: dict) -> dict:
        """Predict if data point has quality issues"""
        features = self.extract_features(data_point)
        features_scaled = self.scaler.transform(features)

        # Predict probability of being bad data
        prob_bad = self.model.predict_proba(features_scaled)[0][1]

        return {
            'is_suspicious': prob_bad > 0.7,
            'confidence': prob_bad,
            'recommendation': 'FLAG_FOR_REVIEW' if prob_bad > 0.7 else 'ACCEPT'
        }

    def train(self, training_data: pd.DataFrame):
        """Train model on historical data with known quality labels"""
        X = training_data.drop('is_bad_data', axis=1)
        y = training_data['is_bad_data']

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
```

---

#### B. Anomaly Detection Model (Unsupervised)
```python
from sklearn.ensemble import IsolationForest
import numpy as np

class DISAnomalyDetector:
    """Detect anomalies in real-time parameter streams"""

    def __init__(self):
        self.model = IsolationForest(
            contamination=0.05,  # Expect 5% anomalies
            random_state=42
        )

    def fit(self, historical_data: np.ndarray):
        """Train on historical normal data"""
        self.model.fit(historical_data)

    def detect_anomaly(self, data_point: np.ndarray) -> dict:
        """Detect if data point is anomalous"""
        prediction = self.model.predict([data_point])
        score = self.model.score_samples([data_point])[0]

        return {
            'is_anomaly': prediction[0] == -1,
            'anomaly_score': score,
            'severity': 'HIGH' if score < -0.5 else 'MEDIUM' if score < -0.3 else 'LOW'
        }
```

---

#### C. Auto-Correction Model
```python
class DISAutoCorrector:
    """Automatically correct common data errors"""

    def __init__(self):
        self.correction_rules = [
            self.correct_unit_errors,
            self.correct_decimal_errors,
            self.correct_outliers,
            self.correct_missing_values
        ]

    def attempt_correction(self, data_point: dict, error_type: str) -> dict:
        """Attempt to auto-correct data error"""

        for rule in self.correction_rules:
            if rule.can_handle(error_type):
                corrected_value = rule.correct(data_point)

                if corrected_value:
                    return {
                        'corrected': True,
                        'original_value': data_point['value'],
                        'corrected_value': corrected_value,
                        'correction_method': rule.__name__,
                        'confidence': rule.confidence_score(data_point, corrected_value)
                    }

        return {'corrected': False, 'reason': 'No applicable correction rule'}

    def correct_unit_errors(self, data_point: dict) -> float:
        """Fix common unit conversion errors (e.g., bar instead of psi)"""
        value = data_point['value']
        expected_unit = data_point['expected_unit']
        actual_unit = data_point['actual_unit']

        if expected_unit == 'psi' and value < 200:
            # Likely in bar, convert to psi
            return value * 14.5038

        return None

    def correct_decimal_errors(self, data_point: dict) -> float:
        """Fix misplaced decimal points"""
        value = data_point['value']
        historical_mean = data_point['historical_mean']

        # If value is 10× or 0.1× historical mean, likely decimal error
        if abs(value - historical_mean * 10) < abs(value - historical_mean):
            return value / 10
        elif abs(value - historical_mean / 10) < abs(value - historical_mean):
            return value * 10

        return None

    def correct_outliers(self, data_point: dict) -> float:
        """Replace outliers with interpolated values"""
        if data_point['is_outlier']:
            # Use moving average of last 10 valid points
            historical_values = data_point['historical_values'][-10:]
            return np.mean(historical_values)

        return None

    def correct_missing_values(self, data_point: dict) -> float:
        """Impute missing values"""
        if data_point['value'] is None:
            # Forward fill from last known good value
            return data_point['last_known_value']

        return None
```

---

### 1.2 Model Training Pipeline

```python
# dis_model_training.py

import psycopg2
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

class DISModelTrainer:
    """Train and evaluate DIS ML models"""

    def __init__(self, db_conn: psycopg2.connection):
        self.db = db_conn

    def prepare_training_data(self, tenant_id: str) -> pd.DataFrame:
        """Extract training data from database"""

        query = f"""
        SELECT
          rtp.value,
          rtp.parameter_name,
          rtp.timestamp,
          rtp.source,
          rtp.quality_code,
          w.well_age_days,
          w.well_type,
          -- Label: 1 if manually flagged as bad data
          CASE WHEN rtp.quality_code = 'BAD' THEN 1 ELSE 0 END as is_bad_data
        FROM {tenant_id}_streams.real_time_parameters rtp
        JOIN {tenant_id}_data.wells w ON rtp.well_id = w.well_id
        WHERE rtp.timestamp > NOW() - INTERVAL '90 days'
        """

        df = pd.read_sql(query, self.db)
        return df

    def train_quality_predictor(self, tenant_id: str):
        """Train data quality prediction model"""

        # Load data
        df = self.prepare_training_data(tenant_id)

        # Feature engineering
        df['zscore'] = (df['value'] - df['value'].mean()) / df['value'].std()
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['is_manual'] = (df['source'] == 'Manual_Entry').astype(int)

        # Split
        X = df[['value', 'zscore', 'hour', 'is_manual', 'well_age_days']]
        y = df['is_bad_data']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train
        predictor = DISQualityPredictor()
        predictor.model.fit(X_train, y_train)

        # Evaluate
        y_pred = predictor.model.predict(X_test)

        print("Classification Report:")
        print(classification_report(y_test, y_pred))

        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        # Cross-validation
        cv_scores = cross_val_score(predictor.model, X_train, y_train, cv=5)
        print(f"\nCross-validation scores: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

        # Save model
        import joblib
        joblib.dump(predictor, f'models/dis_quality_predictor_{tenant_id}.pkl')

        return predictor
```

---

### 1.3 Real-Time DIS Scoring Service

```python
# dis_realtime_service.py

import asyncio
import aioredis
from typing import Dict

class DISRealtimeService:
    """Real-time DIS calculation and alerting"""

    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url)
        self.quality_predictor = DISQualityPredictor()
        self.anomaly_detector = DISAnomalyDetector()

    async def process_incoming_data(self, data_point: dict):
        """Process incoming data point in real-time"""

        # 1. Predict quality
        quality_prediction = self.quality_predictor.predict_quality(data_point)

        # 2. Detect anomaly
        anomaly_result = self.anomaly_detector.detect_anomaly(data_point['value'])

        # 3. Calculate real-time DIS
        dis_score = self.calculate_realtime_dis(data_point, quality_prediction, anomaly_result)

        # 4. Store in Redis (fast cache)
        await self.cache_dis_score(data_point['well_id'], dis_score)

        # 5. Trigger alert if needed
        if dis_score < 50:
            await self.trigger_low_dis_alert(data_point, dis_score)

        return dis_score

    async def cache_dis_score(self, well_id: str, dis_score: float):
        """Cache DIS score in Redis"""
        await self.redis.setex(
            f"dis:realtime:{well_id}",
            300,  # 5-minute TTL
            dis_score
        )

    async def trigger_low_dis_alert(self, data_point: dict, dis_score: float):
        """Send alert for low DIS score"""
        alert = {
            'type': 'LOW_DIS_ALERT',
            'well_id': data_point['well_id'],
            'dis_score': dis_score,
            'timestamp': data_point['timestamp'],
            'message': f"Data quality degraded: DIS = {dis_score:.0f}"
        }

        # Publish to Redis pub/sub
        await self.redis.publish('alerts:dis', alert)
```

---

## 2. Data Pipeline Schema for DIS Metadata

**Author:** Angus Campbell - Data Engineering

### 2.1 PostgreSQL Schema Updates

```sql
-- Add DIS metadata columns to all tables

-- Real-time parameters table
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS dis_score NUMERIC(5,2);
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS quality_flag VARCHAR(20); -- 'GOOD', 'SUSPECT', 'BAD'
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS quality_checked_at TIMESTAMPTZ;
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS quality_checked_by VARCHAR(100);
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS auto_corrected BOOLEAN DEFAULT FALSE;
ALTER TABLE real_time_parameters ADD COLUMN IF NOT EXISTS original_value NUMERIC(12,2); -- Before correction

-- Wells table (aggregated DIS)
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_overall NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_completeness NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_accuracy NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_consistency NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_timeliness NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_provenance NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS dis_last_calculated TIMESTAMPTZ;

-- Create DIS audit table
CREATE TABLE IF NOT EXISTS dis_quality_audit (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  well_id VARCHAR(100),
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  parameter_name VARCHAR(100),
  original_value NUMERIC(12,2),
  corrected_value NUMERIC(12,2),
  correction_method VARCHAR(50),
  correction_confidence NUMERIC(5,2),
  corrected_at TIMESTAMPTZ DEFAULT NOW(),
  corrected_by VARCHAR(100), -- 'SYSTEM' or user ID
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ
);

CREATE INDEX idx_dis_audit_tenant ON dis_quality_audit(tenant_id);
CREATE INDEX idx_dis_audit_well ON dis_quality_audit(well_id);
CREATE INDEX idx_dis_audit_timestamp ON dis_quality_audit(corrected_at DESC);

-- Create DIS alerts table
CREATE TABLE IF NOT EXISTS dis_alerts (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  well_id VARCHAR(100),
  alert_type VARCHAR(50), -- 'LOW_DIS', 'ANOMALY', 'MISSING_DATA'
  severity VARCHAR(20), -- 'HIGH', 'MEDIUM', 'LOW'
  dis_score NUMERIC(5,2),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(100),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_dis_alerts_tenant ON dis_alerts(tenant_id);
CREATE INDEX idx_dis_alerts_unresolved ON dis_alerts(resolved_at) WHERE resolved_at IS NULL;
```

---

### 2.2 Data Ingestion Pipeline with DIS

```typescript
// ingestion_with_dis.ts

import { DISQualityPredictor, DISAutoCorrector } from './dis_models';

interface IngestedDataPoint {
  well_id: string;
  parameter_name: string;
  value: number;
  timestamp: Date;
  source: string;
}

class DISEnhancedIngestion {
  private quality_predictor: DISQualityPredictor;
  private auto_corrector: DISAutoCorrector;

  async ingest_with_quality_check(data_point: IngestedDataPoint): Promise<void> {
    // 1. Predict quality
    const quality_prediction = await this.quality_predictor.predict_quality(data_point);

    let final_value = data_point.value;
    let auto_corrected = false;
    let original_value = data_point.value;

    // 2. If suspicious, attempt auto-correction
    if (quality_prediction.is_suspicious) {
      const correction_result = await this.auto_corrector.attempt_correction(
        data_point,
        'SUSPICIOUS_VALUE'
      );

      if (correction_result.corrected && correction_result.confidence > 0.80) {
        final_value = correction_result.corrected_value;
        auto_corrected = true;

        // Log correction
        await this.log_correction(data_point, correction_result);
      } else {
        // Flag for manual review
        await this.create_quality_alert(data_point, quality_prediction);
      }
    }

    // 3. Store with DIS metadata
    await this.store_data_with_dis({
      ...data_point,
      value: final_value,
      original_value: auto_corrected ? original_value : null,
      auto_corrected,
      dis_score: this.calculate_dis_from_prediction(quality_prediction),
      quality_flag: quality_prediction.is_suspicious ? 'SUSPECT' : 'GOOD'
    });
  }

  private async log_correction(data_point: IngestedDataPoint, correction: any): Promise<void> {
    await db.query(`
      INSERT INTO dis_quality_audit (
        tenant_id, well_id, parameter_name,
        original_value, corrected_value, correction_method,
        correction_confidence, corrected_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'SYSTEM')
    `, [
      data_point.tenant_id,
      data_point.well_id,
      data_point.parameter_name,
      data_point.value,
      correction.corrected_value,
      correction.correction_method,
      correction.confidence
    ]);
  }
}
```

---

## 3. Mobile Communicator Field Mode

**Author:** Finlay MacLeod - Field Operations Lead

### 3.1 Overview

**Purpose:** Enable field personnel to interact with WellTegra platform **offline** from remote well sites without cellular/internet connectivity.

**Key Features:**
1. **Offline data capture** - Record parameters, photos, voice notes
2. **Sync when online** - Upload data when connectivity restored
3. **Read-only well data** - Pre-cached well information for reference
4. **Safety checklist** - Enforce pre-job safety checks
5. **Emergency protocols** - Offline access to emergency procedures

---

### 3.2 Technical Architecture

**Mobile App:** Progressive Web App (PWA) with offline-first architecture

```javascript
// service-worker.js (PWA offline support)

const CACHE_NAME = 'welltegra-field-v1';
const OFFLINE_DATA_CACHE = 'welltegra-offline-data';

// Cache essential resources
const CACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/offline.html',
  '/emergency-procedures.pdf'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

// Fetch with offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Offline - serve from cache
        return caches.match(event.request);
      })
  );
});
```

---

### 3.3 Offline Data Collection

```typescript
// offline_data_capture.ts

interface FieldObservation {
  id: string;
  well_id: string;
  timestamp: Date;
  observer: string;
  observations: {
    wellhead_pressure?: number;
    flow_rate?: number;
    visible_leaks?: boolean;
    unusual_sounds?: boolean;
    equipment_condition?: string; // 'GOOD', 'FAIR', 'POOR'
    notes?: string;
  };
  photos?: Blob[];
  voice_notes?: Blob[];
  synced: boolean;
}

class OfflineDataManager {
  private db: IDBDatabase; // IndexedDB for offline storage

  async save_observation(observation: FieldObservation): Promise<void> {
    // Store in IndexedDB (works offline)
    const transaction = this.db.transaction(['observations'], 'readwrite');
    const store = transaction.objectStore('observations');

    observation.synced = false;
    await store.add(observation);

    console.log('Observation saved offline. Will sync when online.');
  }

  async sync_when_online(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Still offline. Sync pending.');
      return;
    }

    // Get all unsynced observations
    const transaction = this.db.transaction(['observations'], 'readonly');
    const store = transaction.objectStore('observations');
    const unsynced = await store.index('synced').getAll(false);

    console.log(`Syncing ${unsynced.length} offline observations...`);

    for (const observation of unsynced) {
      try {
        // Upload to server
        await fetch('/api/field-observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(observation)
        });

        // Mark as synced
        observation.synced = true;
        const updateTx = this.db.transaction(['observations'], 'readwrite');
        await updateTx.objectStore('observations').put(observation);

        console.log(`Synced observation ${observation.id}`);
      } catch (error) {
        console.error(`Failed to sync observation ${observation.id}:`, error);
      }
    }
  }

  // Auto-sync when connection restored
  start_auto_sync(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored. Starting sync...');
      this.sync_when_online();
    });
  }
}
```

---

### 3.4 Safety Checklist (Offline)

```typescript
// safety_checklist.ts

interface SafetyChecklistItem {
  id: string;
  description: string;
  required: boolean;
  checked: boolean;
  checked_by?: string;
  checked_at?: Date;
}

const FIELD_SAFETY_CHECKLIST: SafetyChecklistItem[] = [
  { id: '1', description: 'PPE worn (hard hat, safety glasses, gloves)', required: true, checked: false },
  { id: '2', description: 'H2S monitor calibrated and functional', required: true, checked: false },
  { id: '3', description: 'Emergency shutdown location identified', required: true, checked: false },
  { id: '4', description: 'Wind direction noted (for H2S escape)', required: true, checked: false },
  { id: '5', description: 'Communication equipment tested', required: true, checked: false },
  { id: '6', description: 'Permit to Work (PTW) signed', required: true, checked: false },
  { id: '7', description: 'Wellhead pressure recorded', required: true, checked: false }
];

class SafetyChecklistManager {
  can_proceed_to_work(): boolean {
    // All required items must be checked
    const all_required_checked = FIELD_SAFETY_CHECKLIST
      .filter(item => item.required)
      .every(item => item.checked);

    return all_required_checked;
  }

  render_checklist(): string {
    let html = '<div class="safety-checklist">';
    html += '<h2>Pre-Job Safety Checklist</h2>';

    for (const item of FIELD_SAFETY_CHECKLIST) {
      html += `
        <div class="checklist-item">
          <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} />
          <label for="${item.id}">${item.description}</label>
          ${item.required ? '<span class="required">*</span>' : ''}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }
}
```

---

## 4. Digital Twin Asset Library

**Author:** Rowan Ross - Drilling Engineer

### 4.1 Overview

**Purpose:** Catalog of all physical equipment, tools, and materials used in well operations, with 3D models and specifications.

### 4.2 Schema

```sql
CREATE TABLE digital_twin_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(100) UNIQUE NOT NULL,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(50) NOT NULL, -- 'BHA_COMPONENT', 'TOOL', 'CONSUMABLE'
  category VARCHAR(100), -- 'Coiled_Tubing', 'Fishing_Tool', 'Packer', etc.

  -- Physical specifications
  specifications JSONB NOT NULL, -- {od, id, length, weight, material, etc.}

  -- 3D model
  model_3d_url VARCHAR(500), -- Link to 3D model file (GLB/GLTF format)
  thumbnail_url VARCHAR(500),

  -- Documentation
  datasheet_url VARCHAR(500),
  manual_url VARCHAR(500),
  certification_docs JSONB, -- Array of certificate URLs

  -- Availability & tracking
  quantity_available INT DEFAULT 0,
  quantity_in_use INT DEFAULT 0,
  current_location VARCHAR(200), -- 'Warehouse_A', 'Well_666', 'In_Transit'

  -- Maintenance
  last_inspection_date DATE,
  next_inspection_date DATE,
  condition VARCHAR(20), -- 'NEW', 'GOOD', 'FAIR', 'POOR', 'RETIRED'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON digital_twin_assets(asset_type);
CREATE INDEX idx_assets_category ON digital_twin_assets(category);
CREATE INDEX idx_assets_location ON digital_twin_assets(current_location);
```

---

### 4.3 Example Assets

```json
{
  "asset_id": "CT_REEL_001",
  "asset_name": "2-inch Coiled Tubing Reel #001",
  "asset_type": "TOOL",
  "category": "Coiled_Tubing",
  "specifications": {
    "outer_diameter": 2.0,
    "inner_diameter": 1.5,
    "length": 15000,
    "weight": 0.8,
    "material": "Carbon_Steel_API_5ST",
    "max_working_pressure": 10000,
    "max_yield_strength": 80000
  },
  "model_3d_url": "https://cdn.welltegra.com/models/ct_reel_001.glb",
  "thumbnail_url": "https://cdn.welltegra.com/thumbnails/ct_reel_001.jpg",
  "quantity_available": 1,
  "current_location": "Well_666",
  "last_inspection_date": "2025-10-15",
  "next_inspection_date": "2026-01-15",
  "condition": "GOOD"
}
```

---

## 5. Contractual NPT Tracker

**Author:** Marcus King - VP Financial Modeling

### 5.1 Overview

**Purpose:** Track Non-Productive Time (NPT) and automatically classify costs as **chargeable (contractor fault)** or **non-chargeable (operator decision)** based on contract terms.

### 5.2 NPT Classification

```typescript
enum NPT_Category {
  // Chargeable to Contractor
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  PERSONNEL_ERROR = 'PERSONNEL_ERROR',
  DELAYED_MOBILIZATION = 'DELAYED_MOBILIZATION',

  // Non-Chargeable (Operator)
  WEATHER_DELAY = 'WEATHER_DELAY',
  WAITING_ON_OPERATOR = 'WAITING_ON_OPERATOR',
  REGULATORY_HOLD = 'REGULATORY_HOLD',
  SCOPE_CHANGE = 'SCOPE_CHANGE'
}

interface NPT_Event {
  id: string;
  well_id: string;
  start_time: Date;
  end_time: Date;
  duration_hours: number;
  category: NPT_Category;
  description: string;
  cost: number;
  chargeable_to_contractor: boolean;
  contract_clause_reference: string; // e.g., "Section 4.2.1"
  approved_by?: string;
  disputed: boolean;
}
```

---

### 5.3 Automated NPT Cost Calculation

```typescript
class NPTTracker {
  calculate_npt_cost(event: NPT_Event): number {
    // Daily rig rate
    const rig_rate = 50000; // $50k/day
    const hourly_rate = rig_rate / 24;

    // Personnel costs
    const personnel_count = 15;
    const avg_hourly_rate = 75;
    const personnel_cost = personnel_count * avg_hourly_rate * event.duration_hours;

    // Equipment standby cost
    const equipment_standby_rate = 500; // $/hour
    const equipment_cost = equipment_standby_rate * event.duration_hours;

    return hourly_rate * event.duration_hours + personnel_cost + equipment_cost;
  }

  classify_chargeability(event: NPT_Event): boolean {
    // Automatically classify based on category
    const chargeable_categories = [
      NPT_Category.EQUIPMENT_FAILURE,
      NPT_Category.PERSONNEL_ERROR,
      NPT_Category.DELAYED_MOBILIZATION
    ];

    return chargeable_categories.includes(event.category);
  }
}
```

---

## 6. NLP Model for Contract Parsing

**Author:** Dr. Alistair Fraser - Data Scientist

### 6.1 Overview

**Purpose:** Use Natural Language Processing to extract key clauses from service contracts and auto-classify NPT events based on contract terms.

### 6.2 Named Entity Recognition (NER)

```python
# contract_ner.py

from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

class ContractNERModel:
    """Extract entities from service contracts"""

    def __init__(self):
        # Use pre-trained legal NER model
        self.tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
        self.model = AutoModelForTokenClassification.from_pretrained("nlpaueb/legal-bert-base-uncased")
        self.ner_pipeline = pipeline("ner", model=self.model, tokenizer=self.tokenizer)

    def extract_npt_clauses(self, contract_text: str) -> list:
        """Extract NPT-related clauses from contract"""

        # Search for NPT-related sections
        npt_keywords = [
            "non-productive time",
            "downtime",
            "chargeable",
            "contractor responsibility",
            "equipment failure",
            "delay penalty"
        ]

        clauses = []
        sentences = contract_text.split('.')

        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in npt_keywords):
                # Extract entities
                entities = self.ner_pipeline(sentence)

                clauses.append({
                    'text': sentence.strip(),
                    'entities': entities
                })

        return clauses

    def classify_npt_event(self, event_description: str, contract_clauses: list) -> dict:
        """Classify NPT event based on contract terms"""

        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        # Find most similar contract clause
        vectorizer = TfidfVectorizer()
        clause_texts = [c['text'] for c in contract_clauses]

        tfidf_matrix = vectorizer.fit_transform(clause_texts + [event_description])
        event_vector = tfidf_matrix[-1]
        clause_vectors = tfidf_matrix[:-1]

        # Calculate similarity
        similarities = cosine_similarity(event_vector, clause_vectors)[0]
        most_similar_idx = similarities.argmax()

        return {
            'matched_clause': contract_clauses[most_similar_idx],
            'similarity_score': similarities[most_similar_idx],
            'chargeable': 'contractor responsibility' in contract_clauses[most_similar_idx]['text'].lower()
        }
```

---

## 7. Automated Vendor Scorecard

**Author:** Marcus King - VP Financial Modeling

### 7.1 Enhanced Vendor Scorecard

**Current v23 Implementation:** Manual 1-5 star ratings

**Enhanced v24 Implementation:** Automated scoring based on performance data

```typescript
interface VendorScorecard {
  vendor_id: string;
  vendor_name: string;
  category: string; // 'Coiled_Tubing', 'Wireline', 'Cementing', etc.

  // Performance metrics (auto-calculated)
  scores: {
    quality: number;        // 0-100 (based on job success rate)
    cost: number;           // 0-100 (vs. industry benchmark)
    schedule: number;       // 0-100 (on-time completion %)
    safety: number;         // 0-100 (incident-free days)
    responsiveness: number; // 0-100 (response time to callouts)
    experience: number;     // 0-100 (years in business, certifications)
  };

  overall_score: number; // Weighted average

  // Historical data
  total_jobs: number;
  successful_jobs: number;
  npt_caused_hours: number;
  average_cost_vs_afe: number; // % deviation from AFE

  // Trend
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  last_updated: Date;
}
```

---

### 7.2 Auto-Calculation Logic

```typescript
class VendorScorecardCalculator {
  calculate_vendor_scores(vendor_id: string): VendorScorecard {
    const jobs = this.get_vendor_jobs(vendor_id);

    // Quality Score
    const success_rate = jobs.filter(j => j.success).length / jobs.length;
    const quality_score = success_rate * 100;

    // Cost Score (inverse - lower cost = higher score)
    const avg_cost_deviation = jobs.reduce((sum, j) => sum + j.cost_vs_afe, 0) / jobs.length;
    const cost_score = Math.max(0, 100 - Math.abs(avg_cost_deviation));

    // Schedule Score
    const on_time_rate = jobs.filter(j => j.on_time).length / jobs.length;
    const schedule_score = on_time_rate * 100;

    // Safety Score
    const incidents = jobs.filter(j => j.had_incident).length;
    const safety_score = Math.max(0, 100 - (incidents / jobs.length * 100));

    // Overall Score (weighted)
    const overall_score =
      quality_score * 0.30 +
      cost_score * 0.25 +
      schedule_score * 0.20 +
      safety_score * 0.15 +
      responsiveness_score * 0.10;

    return {
      vendor_id,
      scores: { quality_score, cost_score, schedule_score, safety_score },
      overall_score,
      total_jobs: jobs.length,
      trend: this.calculate_trend(jobs)
    };
  }
}
```

---

## 8. Vendor Scorecard AI Integration

**Author:** Dr. Alistair Fraser - Data Scientist & CTO

### 8.1 AI-Powered Vendor Recommendation

```typescript
class AIVendorRecommender {
  async recommend_vendor(job_requirements: JobSpec): Promise<VendorRecommendation[]> {
    // 1. Get all qualified vendors
    const vendors = await this.get_qualified_vendors(job_requirements.category);

    // 2. Filter by availability
    const available_vendors = vendors.filter(v =>
      this.check_availability(v, job_requirements.start_date, job_requirements.duration)
    );

    // 3. Score each vendor using AI
    const scored_vendors = [];

    for (const vendor of available_vendors) {
      const scorecard = await this.get_vendor_scorecard(vendor.id);

      // Use LLM to analyze vendor fit
      const llm_analysis = await this.analyze_vendor_fit(vendor, job_requirements, scorecard);

      scored_vendors.push({
        vendor,
        scorecard,
        llm_confidence: llm_analysis.confidence,
        recommendation_score: this.calculate_recommendation_score(scorecard, llm_analysis),
        reasoning: llm_analysis.reasoning
      });
    }

    // 4. Sort by recommendation score
    scored_vendors.sort((a, b) => b.recommendation_score - a.recommendation_score);

    return scored_vendors.slice(0, 3); // Top 3 recommendations
  }

  async analyze_vendor_fit(
    vendor: Vendor,
    job_requirements: JobSpec,
    scorecard: VendorScorecard
  ): Promise<LLMAnalysis> {

    const prompt = `
      Analyze if this vendor is a good fit for the job:

      Vendor: ${vendor.name}
      - Overall Score: ${scorecard.overall_score}/100
      - Quality: ${scorecard.scores.quality}/100
      - Safety: ${scorecard.scores.safety}/100
      - Recent Jobs: ${scorecard.total_jobs}
      - NPT Caused: ${scorecard.npt_caused_hours} hours

      Job Requirements:
      - Type: ${job_requirements.category}
      - Complexity: ${job_requirements.complexity}
      - Duration: ${job_requirements.duration} hours
      - Safety-Critical: ${job_requirements.safety_critical}

      Is this vendor a good fit? Provide reasoning.
    `;

    const llm_response = await callLLM(prompt);

    return {
      confidence: llm_response.confidence,
      reasoning: llm_response.text
    };
  }
}
```

---

## Summary & Next Steps

### Documents Created:
1. ✅ Sandboxed Tenant Architecture (Catriona Cameron)
2. ✅ One-Way Ingestion Connector (Angus Campbell)
3. ✅ AI Co-Pilot Redesign (Alistair Fraser, Rowan Ross)
4. ✅ Physical Constraints (Rowan Ross)
5. ✅ Data Integrity Score Framework (Dr. Isla Munro)
6. ✅ DIS Model Implementation (Dr. Alistair Fraser)
7. ✅ Data Pipeline Schema (Angus Campbell)
8. ✅ Mobile Communicator (Finlay MacLeod)
9. ✅ Digital Twin Asset Library (Rowan Ross)
10. ✅ NPT Tracker (Marcus King)
11. ✅ NLP Contract Parsing (Dr. Alistair Fraser)
12. ✅ Automated Vendor Scorecard (Marcus King)
13. ✅ Vendor Scorecard AI Integration (Dr. Alistair Fraser)

### Implementation Priority:
1. **Phase 1 (Months 1-3):** Sandboxed Tenant + Data Ingestion
2. **Phase 2 (Months 4-6):** DIS Framework + Mobile Field Mode
3. **Phase 3 (Months 7-12):** AI Co-Pilot + Digital Twin
4. **Phase 4 (Months 13-18):** NPT Tracker + Vendor Management

---

**Document Control:**
- **Version:** 1.0 (Consolidated Specifications)
- **Date:** 2025-11-06
- **Distribution:** Engineering, Product, Executive Team
- **Classification:** Internal Use Only

---

**Contacts:**
- **Security & Cloud:** Catriona Cameron (catriona.cameron@welltegra.com)
- **Data Engineering:** Angus Campbell (angus.campbell@welltegra.com)
- **CTO & Data Science:** Dr. Alistair Fraser (alistair.fraser@welltegra.com)
- **Drilling Engineering:** Rowan Ross (rowan.ross@welltegra.com)
- **Well Integrity:** Dr. Isla Munro (isla.munro@welltegra.com)
- **Field Operations:** Finlay MacLeod (finlay.macleod@welltegra.com)
- **Financial Modeling:** Marcus King (marcus.king@welltegra.com)
