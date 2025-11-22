# 🚀 Raghav QSR Network - Production System

**Status:** Phase 1 - Building Custom Evals  
**Purpose:** Generate 30 viral LinkedIn posts for Raghav using agent networks and custom leverage evals

---

## 📊 What This Is

Production agent network that:
1. Analyzes QSR (Quick Service Restaurant) companies with deep research
2. Generates posts matching Raghav's proven viral patterns
3. Uses custom evals to ensure quality (contrarian openings, financial data, gap insights)
4. Learns from 51 historical posts (30 viral + 21 flops)

---

## 🎯 Business Model

- **Client:** Raghav (viral content creator)
- **Output:** 40 posts/month @ $8-10k/month
- **Cost:** ~$140/month (APIs)
- **Margin:** 98%+
- **Competitive Moat:** Custom leverage evals built from his proven content

---

## 📁 Project Structure

```
raghav-qsr-network/
├── data/
│   ├── posts/
│   │   ├── all-posts.json          # MAIN FILE - add posts here
│   │   ├── viral-posts.json        # Auto-generated
│   │   └── flop-posts.json         # Auto-generated
│   └── README.md
│
├── src/
│   ├── analysis/                   # Post analysis tools
│   │   ├── scorers/               # Engagement scorers
│   │   ├── utils/                 # Utilities (split, stats)
│   │   └── analyze-post.ts        # CLI analyzer
│   │
│   ├── scripts/                   # Helper scripts
│   │   ├── add-post.ts           # Add new posts
│   │   └── refresh-data.ts       # Regenerate splits
│   │
│   └── mastra/                    # Production system
│       ├── index.ts              # Main Mastra instance
│       ├── evals/                # Phase 1: Custom evals
│       ├── agents/               # Phase 3: QSR agents
│       └── tools/                # Phase 2: Exa tool
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start

### Setup
```bash
npm install
cp .env.example .env  # Add your API keys
```

### Working with Posts

**Add a new post:**
```bash
npm run add-post
```

**Refresh viral/flop splits:**
```bash
npm run refresh-data
```

**Analyze a post:**
```bash
npm run analyze              # Custom post
npm run analyze:high         # Test top performer
npm run analyze:low          # Test low performer
```

---

## 🏗️ Development Phases

### ✅ Phase 0: Infrastructure (COMPLETE)
- File structure organized
- Data management utilities
- Post analysis tools

### 🔨 Phase 1: Custom Evals (CURRENT)
Build leverage signal evals based on 51 posts analysis:
- Contrarian Opening Eval
- Financial Data Eval
- Gap Insight Eval
- Raghav Voice Eval
- Anti-Pattern Eval

### 📋 Phase 2: Exa Integration
Real research with financial data extraction

### 📋 Phase 3: Memory Loading
Load 51 posts into resource-scoped memory

### 📋 Phase 4: Generation Pipeline
Generate 30 posts with quality loops (0.85+ score threshold)

---

## 📊 Data Stats

- **Total Posts:** 51
- **Viral Posts:** ~30 (engagement > 100)
- **Flop Posts:** ~21 (engagement < 100)
- **Engagement Gap:** ~10x between viral and flop

See `data/README.md` for detailed data structure.

---

## 🔗 Reference

**Learning Project:** `../blog-post-network/`  
**Handoff Doc:** `../blog-post-network/HANDOFF-TO-NEXT-SESSION.md`

---

Built with [Mastra](https://mastra.ai) 🎯
