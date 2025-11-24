# QSR Insight Discovery Network

## Focus: 80/20 Principle

**Insight Quality = 80% of Viral Engagement**  
Strong insights drive virality. Writing is just presentation.

**Goal:** Build a Network Mode system that discovers viral-worthy QSR insights consistently.

---

## Architecture: Two Separate Networks

```
INSIGHT NETWORK (Phase 1 - THE FOCUS)
├─ Generate viral insight hypotheses
├─ Validate shock factor + mechanism
├─ Deep research if promising 
└─ Output: Structured insight data

WRITING NETWORK (Phase 2 - LATER)  
├─ Input: Insight from Phase 1
├─ Convert to viral post
└─ Output: Published post
```

**Priority:** Build Insight Network first, validate it works, then add Writing Network.

---

## Memory System: Prevent Duplicates

Simple semantic memory to ensure no repeated insights:

```typescript
// src/mastra/memory/index.ts
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const INSIGHT_MEMORY = new Memory({
    storage: new LibSQLStore({
    url: "file:qsr-insights.db",
    }),
    embedder: openai.embedding('text-embedding-3-small'),
});
```

**How it works:**
- Network stores each generated insight in memory
- Before generating new insights, check semantic similarity  
- Reject if >85% similar to previous insights
- Ensures every insight is unique

---

## Core Strategy: Network Mode Instructions

**Key insight:** Use natural language instructions instead of complex code. Easy to iterate.

### Your Manual Process (What We're Automating):

1. **Look for shocking numerical contrasts** (10x+ gaps between similar companies)
2. **Find hidden mechanisms** (non-obvious reasons WHY the gap exists)  
3. **Validate with data** (SEC filings, earnings, unit economics)
4. **Focus on same-company paradoxes** (Taco Bell vs Pizza Hut under Yum!)
5. **Calculate the mechanism** (specific percentages, dollar amounts)

### Research Strategies (Instruction-Based):

```typescript
const RESEARCH_STRATEGIES = {
  SHOCKING_CONTRAST: `
    Find 10x+ gaps between QSR companies.
    Focus on revenue per store, profit margins, same parent companies.
    Look for: Chick-fil-A $8.5M vs Subway $500K scenarios.
  `,
  
  HIDDEN_MECHANISM: `
    Uncover WHY the gap exists.
    Dig into franchise models, operational differences, cost structures.
    Use SEC filings and earnings calls for insider details.
  `,
  
  CONTRARIAN_ANGLE: `
    Challenge conventional wisdom with data.
    Find strategies that seem wrong but work (like Chick-fil-A closing Sundays).
  `
};
```

---

## The Insight Network (Network Mode)

Simple AgentNetwork with instructions that you can rapidly iterate on.

```typescript
// src/mastra/networks/insight-network.ts
export const qsrInsightNetwork = new AgentNetwork({
  name: 'QSR Insight Discovery Network',
  
  instructions: `
    Your job: Find viral QSR insights with 10x+ shock factor.
    
    VIRAL INSIGHT PATTERN (from analyzing 5 viral posts):
    1. SHOCKING HOOK (40% of engagement)
       - Numerical contrasts: "$8.5M vs $500K" (17x gap)
       - Absurd numbers: "$27.4M per restaurant"  
       - Same company paradoxes: "Same parent, 3.7x profit gap"
    
    2. NON-OBVIOUS MECHANISM (25% of engagement)
       - Hidden insights: "6 years early = $600 LTV captured"
       - Calculated mechanisms: "23% vs 4.5% occupancy cost"
       - Control structures: "Refuses to franchise = $1.2B more"
    
    3. FORENSIC DATA (15% of engagement)
       - Unit economics: "$862K profit, 26.7% margin, 25% ROIC"
       - Derived calculations: "$75K/day → 475 parties → 1,660 covers"
    
    PROCESS:
    1. Generate 3 comparison-focused hypotheses  
    2. Score each on shock factor (10x+ gap = 9-10 points)
    3. If best score >= 7: Deep research (30-50 Exa calls)
    4. If best score < 7: Pivot to different angle
    5. Find the mechanism behind the gap
    6. Calculate specific numbers and percentages
    7. Output structured insight
    
    COMPANIES TO FOCUS ON:
    Chick-fil-A, McDonald's, Chipotle, Taco Bell, Subway, Wingstop, 
    Pizza Hut, Starbucks, Din Tai Fung, Shake Shack
    
    AVOID REPEATING: Check memory before generating new insights.
  `,
  
  model: openai('gpt-4o'),
  memory: INSIGHT_MEMORY,
  
  agents: [
    hypothesisGeneratorAgent,
    shockValidatorAgent, 
    mechanismResearcherAgent,
    comparisonFinderAgent,
    dataCalculatorAgent,
  ],
  
  tools: [
    exaAnswerTool,
    exaDeepResearchTool,
  ],
});
```

### Core Agents

```typescript
// Agents that implement the insight discovery process
export const hypothesisGeneratorAgent = new Agent({
  name: 'hypothesis-generator',
  instructions: `Generate 3 hypotheses focused on shocking QSR contrasts.`,
  model: openai('gpt-4o-mini'),
});

export const shockValidatorAgent = new Agent({
  name: 'shock-validator', 
  instructions: `Score insights 0-10 on shock factor. 10x+ gaps = 9-10 points.`,
  model: openai('gpt-4o'),
});

export const mechanismResearcherAgent = new Agent({
  name: 'mechanism-researcher',
  instructions: `Find the hidden mechanism behind performance gaps.`, 
  model: openai('gpt-4o'),
});
```

---

## Output: Structured Insight

The network outputs structured insights that can later feed into a writing network:

```typescript
interface ViralInsight {
  hook: string;              // "Chick-fil-A makes $8.5M vs Subway's $500K"
  shockScore: number;         // 9.2 (out of 10)  
  mechanism: string;          // "Refuses to franchise = maintains control"
  supportingData: {
    companyA: { revenue: 8500000, margin: 0.267 };
    companyB: { revenue: 500000, margin: 0.04 };
    gap: 17; // 17x difference
  };
  sources: string[];          // SEC filings, earnings calls
  researchCalls: number;      // 42 Exa API calls used
  uniqueness: boolean;        // Checked against memory
}
```

---

## Future: Writing Network (Phase 2)

Once insight discovery works consistently:

```typescript
export const qsrWritingNetwork = new AgentNetwork({
  name: 'QSR Writing Network', 
  
  instructions: `
    Convert structured insights into viral LinkedIn posts.
    Input: ViralInsight object
    Output: Published post
    
    Use Raghav's voice and style from existing posts.
  `,
  
  agents: [
    hookWriterAgent,
    draftWriterAgent, 
    editorAgent,
  ],
});
```

**Interface:** `ViralInsight` → `WritingNetwork` → `PublishedPost`

---

## Implementation Plan

**Phase 1: Insight Network (Focus Here)**
```bash
# 1. Set up project
npm create mastra@latest qsr-insight-network
cd qsr-insight-network

# 2. Build insight network 
# - Memory system
# - Core agents
# - Network instructions
# - Exa API integration

# 3. Test with 1 insight
npm run test:single

# 4. Iterate on instructions until insights are consistently viral-worthy
```

**Phase 2: Writing Network (Later)**
- Build after insight network is proven
- Much simpler since insights will be strong

---

## Cost Estimate

**Insight Network Only:**
- 30-50 Exa Answer calls: $0.03-0.05
- 3 Exa Deep Research calls: $0.03  
- 10-15 GPT-4o calls: $0.10-0.15
- Memory embeddings: $0.001

**Total per insight: ~$0.16-0.23**

Much cheaper focusing on insights first!

---

## Success Criteria

**Phase 1 Complete When:**
- [ ] Generates insights with 8+ shock scores consistently
- [ ] Zero duplicate insights (memory working)
- [ ] Easy to iterate strategies (change instructions)
- [ ] Under $0.25 per insight
- [ ] Can manually write viral posts from the insights

Then build Phase 2.
