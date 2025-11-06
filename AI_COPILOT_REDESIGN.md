# AI Advisor: Interactive Co-Pilot Redesign

**Authors:** Dr. Alistair Fraser (CTO & Data Scientist), Rowan Ross (Drilling Engineer)
**Version:** 2.0
**Date:** 2025-11-06
**Status:** Design Specification

---

## Executive Summary

This document outlines the transformation of WellTegra's **AI Advisor** from a rule-based anomaly detection system to a **conversational AI Co-Pilot** that enables engineers to interact naturally with well data, generate intervention plans, and receive proactive recommendations based on deep domain knowledge.

**Current State (v23):**
- Rule-based threshold alerts (WHP >8000 psi → Red Alert)
- Static recommendations ("Reduce hookload immediately")
- No natural language interface
- No context awareness

**Target State (AI Co-Pilot v2.0):**
- Natural language query interface ("Why is Well 666 showing high WHP?")
- Dynamic plan generation ("Create a plan to remove scale buildup in Well 666")
- Proactive risk identification ("Wells similar to this one failed 2 weeks after showing this pattern")
- Context-aware recommendations (considers well history, equipment, personnel, costs)
- Multi-turn conversations with memory

**Technologies:**
- **LLM:** GPT-4 Turbo / Claude 3.5 Sonnet (via API)
- **RAG (Retrieval-Augmented Generation):** pgvector for semantic search
- **Embeddings:** OpenAI text-embedding-3-large (3072 dimensions)
- **Fine-tuning:** Domain-specific training on well intervention procedures
- **Function Calling:** Structured actions (query database, calculate costs, check equipment availability)

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     User Interface (Web/Mobile)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Chat Interface                                            │  │
│  │  - Natural language input                                  │  │
│  │  - Streaming responses (SSE)                               │  │
│  │  - Code blocks, tables, charts                             │  │
│  │  - Conversation history (per session)                      │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     │ WebSocket / Server-Sent Events (SSE)
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    AI Co-Pilot Backend (Node.js/Python)          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  1. Intent Classification                                  │  │
│  │     - Query Type: question, plan_generation, analysis      │  │
│  │     - Urgency: critical, high, medium, low                 │  │
│  │     - Entities: well_id, parameter, timeframe              │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  2. Context Retrieval (RAG)                                │  │
│  │     - Semantic search over historical data                 │  │
│  │     - Retrieve relevant procedures, failures, reports      │  │
│  │     - Fetch current well state from database               │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  3. LLM Orchestration                                      │  │
│  │     - Prompt engineering (system + user + context)         │  │
│  │     - Function calling (tools: query_db, calculate_cost)   │  │
│  │     - Multi-turn conversation management                   │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  4. Physical Constraint Validation                         │  │
│  │     - Check pressure limits (MAOP, burst rating)           │  │
│  │     - Validate equipment compatibility                     │  │
│  │     - Verify personnel certifications                      │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  5. Response Generation                                    │  │
│  │     - Format as markdown (tables, bullet points)           │  │
│  │     - Include confidence scores                            │  │
│  │     - Add data sources/citations                           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                     │
                     ├─────► PostgreSQL (Well Data, History)
                     │
                     ├─────► pgvector (Document Embeddings)
                     │
                     ├─────► OpenAI / Anthropic API (LLM)
                     │
                     └─────► Redis (Conversation Cache)
```

---

## 2. Natural Language Interface

### 2.1 Example Interactions

**Query Type: Question Answering**
```
User: "Why is Well 666 showing high wellhead pressure?"

AI Co-Pilot:
Well 666 is currently showing elevated wellhead pressure (WHP) of 7,840 psi,
which is 23% above the baseline of 6,350 psi (established over the last 30 days).

Probable Causes (ranked by likelihood):
1. **Scale buildup in tubing** (68% confidence)
   - Similar WHP increase pattern observed in Wells 412, 589 (both had CaCO₃ scale)
   - Flow rate decreased by 15% over last 7 days (consistent with flow restriction)
   - Last scale treatment: 184 days ago (recommended interval: 120-150 days)

2. **Choke valve partially closed** (22% confidence)
   - Choke position: 45% open (down from 62% last week)
   - Operations log shows manual adjustment on 2025-11-02 14:30

3. **Formation pressure increase** (10% confidence)
   - Reservoir pressure model shows slight uptick (+120 psi)
   - Less likely given flow rate decrease

Recommended Action:
Run coiled tubing with scale inhibitor treatment (estimated cost: $85,000,
duration: 18 hours). See "Scale Treatment Procedure ST-007" for details.

Would you like me to generate a detailed intervention plan?
```

---

**Query Type: Plan Generation**
```
User: "Create a plan to remove scale buildup in Well 666"

AI Co-Pilot:
# Scale Removal Intervention Plan - Well 666

## Executive Summary
- **Objective:** Remove calcium carbonate scale from production tubing
- **Method:** Coiled tubing with chemical treatment (HCl + scale inhibitor)
- **Duration:** 22 hours (including rig-up, treatment, rig-down)
- **Cost:** $127,500 (equipment + personnel + chemicals)
- **NPT Risk:** Low (similar operations: 94% success rate)

---

## Pre-Intervention Checklist
- [ ] Verify MAOP (Maximum Allowable Operating Pressure): 10,000 psi ✓
- [ ] Confirm coiled tubing unit availability: **Available Nov 8-10** ✓
- [ ] Check personnel certifications:
  - Coiled tubing operator (IWCF Level 3): John MacLeod ✓
  - Well control supervisor: Sarah Campbell ✓
- [ ] Chemical inventory:
  - 15% HCl (800 gallons): **In stock** ✓
  - Scale inhibitor SI-442 (200 gallons): **Order required (2-day lead time)**
- [ ] Wellhead equipment inspection: **Due (last inspection: 87 days ago)**

---

## Phase 1: Preparation (4 hours)
| Step | Activity | Duration | Personnel | Cost |
|------|----------|----------|-----------|------|
| 1    | Mobilize coiled tubing unit | 2 hr | 3 × Rigger | $2,400 |
| 2    | Rig up CT unit to wellhead | 1.5 hr | 2 × CT Operator | $1,800 |
| 3    | Pressure test (3,000 psi) | 0.5 hr | 1 × Well Control Supervisor | $600 |

**Total Phase 1:** $4,800

---

## Phase 2: Scale Treatment (12 hours)
| Step | Activity | Duration | Personnel | Cost |
|------|----------|----------|-----------|------|
| 4    | Run coiled tubing to 8,450 ft MD | 3 hr | 2 × CT Operator | $3,600 |
| 5    | Pump HCl treatment (800 gal) | 4 hr | 2 × CT Operator, 1 × Chemist | $38,000 |
| 6    | Soak period (reaction time) | 4 hr | 1 × Supervisor | $4,800 |
| 7    | Circulate out spent acid | 1 hr | 2 × CT Operator | $1,200 |

**Total Phase 2:** $47,600

---

## Phase 3: Post-Treatment (6 hours)
| Step | Activity | Duration | Personnel | Cost |
|------|----------|----------|-----------|------|
| 8    | Pull coiled tubing out of hole | 2 hr | 2 × CT Operator | $2,400 |
| 9    | Rig down CT unit | 2 hr | 3 × Rigger | $2,400 |
| 10   | Wellhead function test | 1 hr | 1 × Well Control Supervisor | $1,200 |
| 11   | Return well to production | 1 hr | 1 × Production Engineer | $1,500 |

**Total Phase 3:** $7,500

---

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CT string stuck in tubing | Low (3%) | High | Use real-time WOB monitoring, keep pickup speed <50 ft/min |
| Acid spill during pumping | Medium (8%) | Medium | Secondary containment, spill kit on-site |
| Wellhead seal failure | Very Low (1%) | Critical | Inspect wellhead seals before operation |

**Overall Risk Level:** Low

---

## Success Criteria
- WHP decreases to baseline range (6,200-6,500 psi)
- Flow rate increases by >10% (target: 2,800 bbl/day)
- No damage to tubing (run calipers if WHP doesn't improve)

---

## Cost-Benefit Analysis
- **Total Cost:** $127,500
- **Expected Production Gain:** 420 bbl/day × 180 days = 75,600 bbl
- **Revenue Increase:** 75,600 bbl × $78/bbl = $5,896,800
- **ROI:** 4,524%
- **Payback Period:** 0.6 days

---

**Next Steps:**
1. Approve this plan (click "Approve" to notify operations team)
2. Order scale inhibitor SI-442 (2-day lead time)
3. Schedule wellhead inspection
4. Book coiled tubing unit for Nov 8-10

Would you like me to generate a detailed AFE (Authorization for Expenditure)?
```

---

**Query Type: Proactive Analysis**
```
AI Co-Pilot (Unprompted Alert):

🚨 **Proactive Risk Alert: Well 412**

I've detected a pattern in Well 412 that is similar to 3 historical failures:

**Current Indicators:**
- Hookload trending upward (+8% over 48 hours)
- Differential pressure across BHA increasing (now 450 psi, baseline: 320 psi)
- Torque fluctuations (± 2,500 ft-lbs)

**Similar Historical Cases:**
1. **Well 589 (2024-03-15):** Stuck pipe incident, 72 hours NPT, $420,000 loss
2. **Well 701 (2024-07-22):** Packoff at 9,200 ft, required fishing, $310,000 loss
3. **Well 333 (2023-11-10):** Differential sticking, successful jarring, $85,000 cost

**Prediction:**
- **78% probability** of stuck pipe within next 12 hours if current operations continue
- **Recommended action:** Stop drilling, circulate bottoms-up, increase pump rate to
  320 GPM (from current 240 GPM) to improve hole cleaning

**Time-sensitive:** This condition typically deteriorates rapidly. Immediate action
recommended within next 2 hours.

[View Detailed Analysis] [Dismiss Alert] [Generate Contingency Plan]
```

---

## 3. RAG (Retrieval-Augmented Generation) Implementation

### 3.1 Document Embeddings Pipeline

**Data Sources to Embed:**
1. **Well Intervention Procedures** (150+ documents)
   - Scale treatment procedures
   - Fishing procedures
   - Coiled tubing operations
   - Completion designs

2. **Historical Daily Reports** (10,000+ reports)
   - Daily drilling reports (DDRs)
   - Well completion reports
   - Failure analysis reports

3. **Equipment Manuals** (500+ documents)
   - Coiled tubing specifications
   - BHA component datasheets
   - Wellhead equipment manuals

4. **Best Practices & Lessons Learned** (300+ documents)
   - Post-job reviews
   - Incident investigation reports
   - Operator guidelines

**Embedding Process:**
```python
# embeddings_pipeline.py

import openai
from typing import List, Dict
import psycopg2
from psycopg2.extras import execute_values

openai.api_key = "sk-..."

def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split document into overlapping chunks"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using OpenAI API"""
    response = openai.embeddings.create(
        model="text-embedding-3-large",  # 3072 dimensions
        input=texts
    )
    return [item.embedding for item in response.data]


def store_embeddings(tenant_id: str, documents: List[Dict]):
    """Store document embeddings in PostgreSQL with pgvector"""
    conn = psycopg2.connect("postgresql://localhost/welltegra_production")
    cursor = conn.cursor()

    # Set tenant context for RLS
    cursor.execute(f"SET app.current_tenant = '{tenant_id}'")

    for doc in documents:
        # Chunk document
        chunks = chunk_document(doc['content'], chunk_size=1000, overlap=200)

        # Generate embeddings
        embeddings = generate_embeddings(chunks)

        # Store in database
        data = [
            (
                tenant_id,
                doc['document_id'],
                doc['document_type'],
                i,
                chunk[:200],  # Preview
                embedding,
                doc['metadata']
            )
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]

        execute_values(cursor, f"""
            INSERT INTO {tenant_id}_embeddings.document_vectors
            (tenant_id, document_id, document_type, chunk_index, content_preview, embedding, metadata)
            VALUES %s
        """, data)

    conn.commit()
    conn.close()


# Example usage
documents = [
    {
        'document_id': 'proc_scale_treatment_007',
        'document_type': 'procedure',
        'content': """
            Scale Treatment Procedure ST-007
            Objective: Remove calcium carbonate scale from production tubing
            Method: Coiled tubing with 15% HCl treatment
            ...
        """,
        'metadata': {
            'title': 'Scale Treatment Procedure ST-007',
            'author': 'Dr. Isla Munro',
            'date': '2024-08-15',
            'tags': ['scale', 'coiled_tubing', 'chemical_treatment']
        }
    }
]

store_embeddings('operator_shell_uk', documents)
```

---

### 3.2 Semantic Search

**Query Example:**
```python
# semantic_search.py

def semantic_search(tenant_id: str, query: str, top_k: int = 5) -> List[Dict]:
    """Perform semantic search using pgvector"""

    # Generate query embedding
    query_embedding = openai.embeddings.create(
        model="text-embedding-3-large",
        input=[query]
    ).data[0].embedding

    # Cosine similarity search
    conn = psycopg2.connect("postgresql://localhost/welltegra_production")
    cursor = conn.cursor()

    cursor.execute(f"SET app.current_tenant = '{tenant_id}'")

    cursor.execute(f"""
        SELECT
            document_id,
            document_type,
            chunk_index,
            content_preview,
            metadata,
            1 - (embedding <=> %s::vector) AS similarity
        FROM {tenant_id}_embeddings.document_vectors
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (query_embedding, query_embedding, top_k))

    results = []
    for row in cursor.fetchall():
        results.append({
            'document_id': row[0],
            'document_type': row[1],
            'chunk_index': row[2],
            'content_preview': row[3],
            'metadata': row[4],
            'similarity': row[5]
        })

    conn.close()
    return results


# Example usage
results = semantic_search(
    tenant_id='operator_shell_uk',
    query='How to remove calcium carbonate scale from tubing?',
    top_k=5
)

for result in results:
    print(f"Document: {result['document_id']}")
    print(f"Similarity: {result['similarity']:.2%}")
    print(f"Preview: {result['content_preview']}")
    print("---")
```

---

## 4. LLM Orchestration

### 4.1 Prompt Engineering

**System Prompt Template:**
```
You are the WellTegra AI Co-Pilot, an expert assistant for oil & gas well intervention
operations. You have deep knowledge of:
- Well completion design
- Drilling and workover operations
- Equipment specifications and limitations
- Cost estimation and AFE preparation
- Risk assessment and mitigation
- Regulatory compliance (API, ISO standards)

Your role is to:
1. Answer engineer questions with precise, technical accuracy
2. Generate intervention plans with detailed steps, costs, and risks
3. Proactively identify risks based on historical data patterns
4. Validate recommendations against physical constraints (pressure limits, equipment ratings)

Always:
- Cite data sources (well records, procedures, historical cases)
- Include confidence scores for predictions
- Flag safety-critical information
- Use metric units (SI) with US customary units in parentheses
- Escalate to human experts when uncertain (confidence <70%)

Current Context:
- Tenant: {tenant_name}
- User: {user_name} ({user_role})
- Well: {well_id}
- Current Date: {current_date}

Physical Constraints (CRITICAL - NEVER VIOLATE):
- Well {well_id} MAOP: {maop} psi
- Tubing burst pressure: {burst_pressure} psi
- Maximum hookload: {max_hookload} klbs
- Available equipment: {equipment_list}
```

---

**User Prompt with RAG Context:**
```
Context from WellTegra Knowledge Base:
---
[Document: Scale Treatment Procedure ST-007]
Similarity: 94%
Content: "Scale treatment using coiled tubing with 15% HCl. Recommended soak time:
4 hours. Expected scale removal: 85-95%. Cost: $80,000-$120,000..."

[Document: Well 589 Daily Report - 2024-03-15]
Similarity: 87%
Content: "Scale buildup detected in Well 589. WHP increased from 6,400 psi to 7,900 psi
over 14 days. Flow rate dropped 18%. Coiled tubing treatment successful..."

[Document: Equipment Catalog - Coiled Tubing Unit CTU-002]
Similarity: 82%
Content: "2-inch coiled tubing unit. Max working pressure: 10,000 psi.
Available: Nov 8-10, 2025..."
---

Current Well Data:
- Well ID: W666
- Wellhead Pressure: 7,840 psi (baseline: 6,350 psi)
- Flow Rate: 2,380 bbl/day (down from 2,800 bbl/day)
- Last scale treatment: 184 days ago
- Tubing: 3.5" 12.95 lb/ft L-80 (burst: 11,200 psi)
- Current status: Producing

User Question:
"Create a plan to remove scale buildup in Well 666"
```

---

### 4.2 Function Calling (Tools)

**Available Functions:**
```typescript
// tools.ts

const tools = [
  {
    name: "query_well_data",
    description: "Query current and historical well data from database",
    parameters: {
      type: "object",
      properties: {
        well_id: {
          type: "string",
          description: "Well identifier (e.g., W666)"
        },
        parameters: {
          type: "array",
          items: { type: "string" },
          description: "Parameters to query (e.g., ['wellhead_pressure', 'flow_rate'])"
        },
        timeframe: {
          type: "string",
          description: "Time range (e.g., 'last_30_days', '2024-01-01 to 2024-12-31')"
        }
      },
      required: ["well_id"]
    }
  },

  {
    name: "calculate_intervention_cost",
    description: "Calculate estimated cost for a well intervention",
    parameters: {
      type: "object",
      properties: {
        activities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              activity_code: { type: "string" },
              duration_hours: { type: "number" },
              personnel_count: { type: "number" }
            }
          }
        },
        equipment_list: {
          type: "array",
          items: { type: "string" }
        },
        chemicals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              chemical_name: { type: "string" },
              volume_gallons: { type: "number" }
            }
          }
        }
      },
      required: ["activities"]
    }
  },

  {
    name: "check_equipment_availability",
    description: "Check if equipment is available for specified dates",
    parameters: {
      type: "object",
      properties: {
        equipment_ids: {
          type: "array",
          items: { type: "string" }
        },
        start_date: {
          type: "string",
          format: "date",
          description: "Start date (YYYY-MM-DD)"
        },
        end_date: {
          type: "string",
          format: "date"
        }
      },
      required: ["equipment_ids", "start_date", "end_date"]
    }
  },

  {
    name: "validate_physical_constraints",
    description: "Validate proposed operation against well physical constraints",
    parameters: {
      type: "object",
      properties: {
        well_id: { type: "string" },
        operation: { type: "string" },
        max_pressure: { type: "number" },
        max_hookload: { type: "number" }
      },
      required: ["well_id", "operation"]
    }
  },

  {
    name: "search_similar_operations",
    description: "Find similar historical operations for benchmarking",
    parameters: {
      type: "object",
      properties: {
        operation_type: {
          type: "string",
          enum: ["scale_treatment", "fishing", "recompletion", "abandonment"]
        },
        well_type: { type: "string" },
        limit: {
          type: "integer",
          default: 10
        }
      },
      required: ["operation_type"]
    }
  }
];


// Function implementations
async function query_well_data(args: any): Promise<any> {
  const { well_id, parameters, timeframe } = args;

  // Query PostgreSQL
  const query = `
    SELECT timestamp, parameter_name, value, unit
    FROM ${tenant_id}_streams.real_time_parameters
    WHERE well_id = $1
      AND parameter_name = ANY($2)
      AND timestamp >= NOW() - INTERVAL '${timeframe}'
    ORDER BY timestamp DESC
  `;

  const result = await pgPool.query(query, [well_id, parameters]);
  return result.rows;
}


async function calculate_intervention_cost(args: any): Promise<any> {
  const { activities, equipment_list, chemicals } = args;

  let total_cost = 0;

  // Calculate personnel costs
  for (const activity of activities) {
    const rate = await getActivityRate(activity.activity_code);
    total_cost += rate.cost_per_hour * activity.duration_hours * activity.personnel_count;
  }

  // Calculate equipment costs
  for (const equipment_id of equipment_list) {
    const rate = await getEquipmentRate(equipment_id);
    total_cost += rate.daily_rate;
  }

  // Calculate chemical costs
  for (const chemical of chemicals) {
    const rate = await getChemicalRate(chemical.chemical_name);
    total_cost += rate.cost_per_gallon * chemical.volume_gallons;
  }

  return {
    total_cost,
    breakdown: {
      personnel: calculatePersonnelCost(activities),
      equipment: calculateEquipmentCost(equipment_list),
      chemicals: calculateChemicalCost(chemicals)
    }
  };
}
```

---

### 4.3 Multi-Turn Conversation Management

**Conversation State:**
```typescript
interface ConversationState {
  session_id: string;
  tenant_id: string;
  user_id: string;
  well_context?: {
    well_id: string;
    well_name: string;
    current_status: string;
  };
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    function_calls?: any[];
  }>;
  active_plan?: {
    plan_id: string;
    plan_type: string; // 'scale_treatment', 'fishing', etc.
    status: 'draft' | 'approved' | 'in_progress' | 'completed';
  };
  created_at: string;
  last_updated: string;
}


// Store conversation in Redis (TTL: 24 hours)
async function saveConversation(state: ConversationState) {
  await redis.setex(
    `conversation:${state.session_id}`,
    86400, // 24 hours
    JSON.stringify(state)
  );
}


// Retrieve conversation context
async function getConversation(session_id: string): Promise<ConversationState | null> {
  const data = await redis.get(`conversation:${session_id}`);
  return data ? JSON.parse(data) : null;
}
```

---

## 5. Physical Constraint Validation (Rowan Ross - Drilling Engineer)

### 5.1 Constraint Types

**Pressure Constraints:**
```typescript
interface PressureConstraints {
  well_id: string;
  maop: number;              // Maximum Allowable Operating Pressure (psi)
  tubing_burst: number;      // Tubing burst pressure (psi)
  tubing_collapse: number;   // Tubing collapse pressure (psi)
  casing_burst: number;      // Casing burst pressure (psi)
  wellhead_rating: number;   // Wellhead pressure rating (psi)
}

function validatePressure(well: PressureConstraints, proposed_pressure: number): ValidationResult {
  const safety_factor = 0.85; // 85% of rated capacity

  if (proposed_pressure > well.tubing_burst * safety_factor) {
    return {
      valid: false,
      violation: 'tubing_burst',
      message: `Proposed pressure ${proposed_pressure} psi exceeds tubing burst limit ` +
               `${well.tubing_burst * safety_factor} psi (with 15% safety margin)`
    };
  }

  if (proposed_pressure > well.wellhead_rating * safety_factor) {
    return {
      valid: false,
      violation: 'wellhead_rating',
      message: `Proposed pressure exceeds wellhead rating`
    };
  }

  return { valid: true };
}
```

---

**Load Constraints (Hookload):**
```typescript
interface LoadConstraints {
  well_id: string;
  max_hookload: number;       // Maximum hookload (klbs)
  derrick_capacity: number;   // Derrick capacity (klbs)
  tubing_weight: number;      // Tubing dry weight (klbs)
  max_overpull: number;       // Maximum safe overpull (klbs)
}

function validateHookload(well: LoadConstraints, proposed_hookload: number): ValidationResult {
  if (proposed_hookload > well.derrick_capacity * 0.90) {
    return {
      valid: false,
      violation: 'derrick_capacity',
      message: `Proposed hookload ${proposed_hookload} klbs exceeds derrick capacity ` +
               `${well.derrick_capacity * 0.90} klbs (90% limit)`
    };
  }

  // Check if overpull is excessive
  const overpull = proposed_hookload - well.tubing_weight;
  if (overpull > well.max_overpull) {
    return {
      valid: false,
      violation: 'overpull',
      message: `Overpull ${overpull} klbs exceeds maximum safe overpull ${well.max_overpull} klbs. ` +
               `Risk of tubing failure.`
    };
  }

  return { valid: true };
}
```

---

**Equipment Compatibility:**
```typescript
interface EquipmentConstraint {
  equipment_id: string;
  compatible_well_types: string[];
  min_tubing_size: number;    // Minimum tubing ID (inches)
  max_working_pressure: number; // Equipment pressure rating (psi)
  max_temperature: number;     // Maximum operating temperature (°F)
}

function validateEquipmentCompatibility(
  well: WellData,
  equipment: EquipmentConstraint
): ValidationResult {

  // Check tubing size
  if (well.tubing_id < equipment.min_tubing_size) {
    return {
      valid: false,
      violation: 'tubing_size',
      message: `Equipment requires minimum tubing ID ${equipment.min_tubing_size}" but ` +
               `well has ${well.tubing_id}" tubing`
    };
  }

  // Check pressure rating
  if (well.maop > equipment.max_working_pressure) {
    return {
      valid: false,
      violation: 'pressure_rating',
      message: `Equipment pressure rating ${equipment.max_working_pressure} psi is ` +
               `below well MAOP ${well.maop} psi`
    };
  }

  // Check well type compatibility
  if (!equipment.compatible_well_types.includes(well.well_type)) {
    return {
      valid: false,
      violation: 'well_type',
      message: `Equipment not compatible with ${well.well_type} wells`
    };
  }

  return { valid: true };
}
```

---

### 5.2 Integration with AI Co-Pilot

```typescript
// Middleware: Validate AI-generated plans
async function validateAIPlan(plan: InterventionPlan, well_id: string): Promise<ValidationResult> {
  const well = await getWellData(well_id);
  const constraints = await getPhysicalConstraints(well_id);

  const violations: string[] = [];

  // Validate each step in the plan
  for (const step of plan.steps) {
    // Check pressure constraints
    if (step.max_pressure) {
      const result = validatePressure(constraints, step.max_pressure);
      if (!result.valid) {
        violations.push(`Step ${step.step_number}: ${result.message}`);
      }
    }

    // Check hookload constraints
    if (step.max_hookload) {
      const result = validateHookload(constraints, step.max_hookload);
      if (!result.valid) {
        violations.push(`Step ${step.step_number}: ${result.message}`);
      }
    }

    // Check equipment compatibility
    if (step.equipment) {
      for (const equipment_id of step.equipment) {
        const equipment = await getEquipmentSpec(equipment_id);
        const result = validateEquipmentCompatibility(well, equipment);
        if (!result.valid) {
          violations.push(`Step ${step.step_number}: ${result.message}`);
        }
      }
    }
  }

  if (violations.length > 0) {
    return {
      valid: false,
      violations,
      message: `Plan contains ${violations.length} physical constraint violations. ` +
               `Human review required before execution.`
    };
  }

  return {
    valid: true,
    message: 'All physical constraints validated successfully'
  };
}
```

---

## 6. Confidence Scoring & Uncertainty

### 6.1 Confidence Calculation

```typescript
interface PredictionConfidence {
  overall_confidence: number;     // 0-100%
  data_quality: number;           // How complete/accurate is input data?
  model_certainty: number;        // How confident is the LLM?
  historical_similarity: number;  // How similar to past cases?
  expert_validation: boolean;     // Has a human reviewed this?
}

function calculateConfidence(
  llm_logprobs: number[],
  rag_similarities: number[],
  data_completeness: number
): PredictionConfidence {

  // LLM certainty from log probabilities
  const avg_logprob = llm_logprobs.reduce((a, b) => a + b, 0) / llm_logprobs.length;
  const model_certainty = Math.exp(avg_logprob) * 100;

  // RAG similarity score
  const historical_similarity = Math.max(...rag_similarities) * 100;

  // Data quality
  const data_quality = data_completeness * 100;

  // Overall confidence (weighted average)
  const overall_confidence =
    model_certainty * 0.4 +
    historical_similarity * 0.4 +
    data_quality * 0.2;

  return {
    overall_confidence,
    model_certainty,
    historical_similarity,
    data_quality,
    expert_validation: false
  };
}
```

---

### 6.2 Escalation to Human Experts

```typescript
// Auto-escalate to human if confidence is low
async function generateResponse(query: string, context: any): Promise<AIResponse> {
  const llm_response = await callLLM(query, context);
  const confidence = calculateConfidence(
    llm_response.logprobs,
    context.rag_similarities,
    context.data_completeness
  );

  if (confidence.overall_confidence < 70) {
    // Escalate to human expert
    await notifyExpert({
      query,
      ai_response: llm_response.content,
      confidence,
      tenant_id: context.tenant_id,
      well_id: context.well_id
    });

    return {
      content: llm_response.content +
        "\n\n⚠️ **Low Confidence Alert**\n" +
        `This recommendation has ${confidence.overall_confidence.toFixed(0)}% confidence. ` +
        `A domain expert has been notified for review. Please wait for human validation ` +
        `before proceeding with this plan.`,
      confidence,
      requires_human_review: true
    };
  }

  return {
    content: llm_response.content,
    confidence,
    requires_human_review: false
  };
}
```

---

## 7. Performance & Scalability

### 7.1 Response Time Targets

| Operation | Target Latency | Notes |
|-----------|----------------|-------|
| Simple question (no RAG) | <2 seconds | Direct LLM call |
| Complex query (with RAG) | <5 seconds | Semantic search + LLM |
| Plan generation | <10 seconds | Multi-step reasoning + cost calc |
| Streaming response | <500ms first token | SSE for real-time feel |

---

### 7.2 Caching Strategy

**Embedding Cache (Redis):**
```typescript
// Cache embeddings for frequently queried documents
async function getEmbeddingCached(text: string): Promise<number[]> {
  const cache_key = `embedding:${hash(text)}`;

  // Check cache
  const cached = await redis.get(cache_key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Generate embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: [text]
  }).data[0].embedding;

  // Store in cache (TTL: 7 days)
  await redis.setex(cache_key, 604800, JSON.stringify(embedding));

  return embedding;
}
```

**LLM Response Cache:**
```typescript
// Cache LLM responses for identical queries (within 1 hour)
async function callLLMCached(prompt: string): Promise<string> {
  const cache_key = `llm_response:${hash(prompt)}`;

  const cached = await redis.get(cache_key);
  if (cached) {
    return cached;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }]
  });

  const content = response.choices[0].message.content;

  // Cache for 1 hour
  await redis.setex(cache_key, 3600, content);

  return content;
}
```

---

## 8. Cost Estimation

**OpenAI API Costs (per 1000 users/month):**

| Component | Usage | Cost |
|-----------|-------|------|
| GPT-4 Turbo (128k context) | 10M input tokens, 2M output tokens | $100 + $300 = $400 |
| text-embedding-3-large | 50M tokens | $65 |
| **Total LLM Costs** | | **$465/month** |

**Per-query cost:** ~$0.05

**Infrastructure Costs:**
| Component | Specification | Monthly Cost |
|-----------|---------------|--------------|
| PostgreSQL (pgvector) | db.r6g.2xlarge (8 vCPU, 64 GB) | $960 |
| Redis (conversation cache) | cache.r6g.large (2 vCPU, 13 GB) | $180 |
| API Servers (EKS) | 5 × t3.xlarge | $750 |
| **Total Infrastructure** | | **$1,890/month** |

**Total Cost (1000 users):** $2,355/month = **$2.36 per user/month**

---

## 9. Success Metrics

### 9.1 KPIs

**User Engagement:**
- Daily active AI Co-Pilot users
- Average queries per user per day
- Conversation length (turns per session)
- User satisfaction score (thumbs up/down)

**Technical Performance:**
- Response time (p50, p95, p99)
- RAG retrieval accuracy (precision @5)
- Physical constraint violation rate (target: <1%)
- LLM hallucination rate (fact-checked against database)

**Business Impact:**
- Time saved per intervention plan (target: 4 hours → 15 minutes)
- Cost estimation accuracy (target: ±10% of actual cost)
- Plans approved without human edits (target: >80%)
- NPT avoided through proactive alerts (measured in $)

---

### 9.2 A/B Testing Plan

**Test Cohorts:**
- **Control Group:** Current v23 (rule-based alerts only)
- **Treatment Group:** AI Co-Pilot v2.0

**Hypothesis:** AI Co-Pilot reduces intervention planning time by >70% and increases plan accuracy.

**Metrics to Compare:**
- Time to create intervention plan
- Number of revisions before approval
- Actual cost vs. estimated cost
- User satisfaction (NPS score)

**Duration:** 90 days

---

## 10. Rollout Plan

### Phase 1: Alpha (Months 1-2)
- Deploy to 10 internal WellTegra engineers
- Focus: Bug fixes, prompt tuning, UI/UX feedback
- Success criteria: 80% positive feedback, <5s response time

### Phase 2: Beta (Months 3-4)
- Deploy to 50 pilot users (2-3 customers)
- Focus: RAG accuracy, domain-specific fine-tuning
- Success criteria: 75% query success rate, <2% constraint violations

### Phase 3: General Availability (Month 5+)
- Roll out to all customers
- Focus: Scale testing, cost optimization
- Success criteria: 99.9% uptime, <$3 per user/month LLM costs

---

## Appendix A: Example Prompts

See `AI_COPILOT_PHYSICAL_CONSTRAINTS.md` for detailed physical constraint logic (Rowan Ross).

---

## Appendix B: RAG Evaluation Dataset

**Test Queries:**
1. "What is the procedure for scale treatment in HPHT wells?"
2. "Find all fishing operations that failed due to differential sticking"
3. "What is the cost range for coiled tubing scale treatments in 2024?"
4. "Which wells are at risk of tubing failure based on current trends?"
5. "Generate a contingency plan if coiled tubing gets stuck at 8,000 ft MD"

**Expected Results:** RAG should retrieve relevant documents with >80% precision @5.

---

**Document Control:**
- **Version History:** 2.0 (Complete Redesign)
- **Previous Version:** 1.0 (Rule-based AI Advisor)
- **Next Review Date:** 2025-12-01
- **Distribution:** Engineering, Product, Data Science
- **Classification:** Internal Use Only

**Contact:**
Dr. Alistair Fraser - CTO & Data Scientist
Email: alistair.fraser@welltegra.com
Slack: @alistair
