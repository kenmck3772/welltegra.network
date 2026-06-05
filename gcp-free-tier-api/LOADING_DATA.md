# Step-by-Step: Load Data into BigQuery (Free Tier)

**Project**: brahan-483303
**Goal**: Load well data so your API can return results

---

## ✅ You've Already Done:

1. Created dataset: `wells`
2. Created table: `well_data` with 5 columns
3. Deployed Cloud Run API

---

## 📊 Step 1: Insert Sample Data

Copy and paste this **entire command** into Cloud Shell:

```bash
bq query --project_id=brahan-483303 --use_legacy_sql=false '
INSERT INTO `brahan-483303.wells.well_data`
(well_id, name, field, total_depth, reservoir_pressure)
VALUES
  ("volve-f1", "15/9-F-1 B", "Volve", 3150.0, 329.6),
  ("volve-f4", "15/9-F-4", "Volve", 3200.0, 325.0),
  ("alpha-01", "Node-01 Alpha", "Brahan", 2850.0, 280.0),
  ("bravo-02", "Node-02 Bravo", "Brahan", 2920.0, 265.0),
  ("charlie-03", "Node-03 Charlie", "Brahan", 3050.0, 290.0)
'
```

**Expected output**:
```
Query complete (X.X sec elapsed, Y bytes processed)
```

---

## 🔍 Step 2: Verify Data Loaded

```bash
bq query --project_id=brahan-483303 --use_legacy_sql=false '
SELECT * FROM `brahan-483303.wells.well_data`
'
```

**Expected output**:
```
+----------+-----------------+--------+-------------+--------------------+
| well_id  |      name       | field  | total_depth | reservoir_pressure |
+----------+-----------------+--------+-------------+--------------------+
| volve-f1 | 15/9-F-1 B      | Volve  |      3150.0 |              329.6 |
| volve-f4 | 15/9-F-4        | Volve  |      3200.0 |              325.0 |
| alpha-01 | Node-01 Alpha   | Brahan |      2850.0 |              280.0 |
| bravo-02 | Node-02 Bravo   | Brahan |      2920.0 |              265.0 |
| charlie-03| Node-03 Charlie| Brahan |      3050.0 |              290.0 |
+----------+-----------------+--------+-------------+--------------------+
```

---

## 🧪 Step 3: Test Your API

```bash
# Get all wells (should return 5 wells)
curl https://brahan-api-371901038176.europe-west2.run.app/api/wells
```

**Expected output**:
```json
{
  "success": true,
  "count": 5,
  "wells": [
    {
      "well_id": "volve-f1",
      "name": "15/9-F-1 B",
      "field": "Volve",
      "total_depth": 3150.0,
      "reservoir_pressure": 329.6
    },
    ...
  ]
}
```

---

## 📁 Alternative: Upload CSV File

If you prefer to load from a CSV file:

### Create CSV file:

```bash
cat > wells.csv << 'EOF'
well_id,name,field,total_depth,reservoir_pressure
volve-f1,15/9-F-1 B,Volve,3150.0,329.6
volve-f4,15/9-F-4,Volve,3200.0,325.0
alpha-01,Node-01 Alpha,Brahan,2850.0,280.0
bravo-02,Node-02 Bravo,Brahan,2920.0,265.0
charlie-03,Node-03 Charlie,Brahan,3050.0,290.0
EOF
```

### Load CSV into BigQuery:

```bash
bq load \
  --project_id=brahan-483303 \
  --source_format=CSV \
  --skip_leading_rows=1 \
  wells.well_data \
  wells.csv
```

---

## 🎯 Complete Command Summary

Just copy these 3 commands in order:

```bash
# 1. Insert data
bq query --project_id=brahan-483303 --use_legacy_sql=false '
INSERT INTO `brahan-483303.wells.well_data`
(well_id, name, field, total_depth, reservoir_pressure)
VALUES
  ("volve-f1", "15/9-F-1 B", "Volve", 3150.0, 329.6),
  ("volve-f4", "15/9-F-4", "Volve", 3200.0, 325.0),
  ("alpha-01", "Node-01 Alpha", "Brahan", 2850.0, 280.0),
  ("bravo-02", "Node-02 Bravo", "Brahan", 2920.0, 265.0),
  ("charlie-03", "Node-03 Charlie", "Brahan", 3050.0, 290.0)
'

# 2. Verify
bq query --project_id=brahan-483303 --use_legacy_sql=false '
SELECT * FROM `brahan-483303.wells.well_data`
'

# 3. Test API
curl https://brahan-api-371901038176.europe-west2.run.app/api/wells
```

---

## 💰 Cost: $0.00

- **BigQuery Storage**: 5 rows = ~1 KB (Free tier: 10 GB)
- **Query**: SELECT = ~500 bytes (Free tier: 1 TB/month)
- **API Calls**: 3 requests (Free tier: 2M requests/month)

**Total**: Completely free!

---

## 🚨 Troubleshooting

**Error: "Table not found"**
- Run: `bq ls --project_id=brahan-483303 wells` to check table exists
- Recreate if needed with the schema command from earlier

**Error: "Permission denied"**
- Run: `gcloud config set project brahan-483303`
- You're already authenticated in Cloud Shell

**API returns empty results**
- Check data exists: `bq query 'SELECT COUNT(*) FROM brahan-483303.wells.well_data'`
- Should return `5`

---

That's it! Your free-tier API now has data to serve.
