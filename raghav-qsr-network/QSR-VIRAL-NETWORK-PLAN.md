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

export const exaAnswerTool = createTool({
  id: 'exa-answer',
  description: 'Get specific answers to research questions',
  inputSchema: z.object({
    queries: z.array(z.string()).describe('Array of 20-50 specific questions'),
  }),
  execute: async ({ context }) => {
    const results = await Promise.all(
      context.queries.map(q => exa.answer(q))
    );
    return results;
  },
});
```

### 2. Exa Deep Research Tool
```typescript
export const exaDeepResearchTool = createTool({
  id: 'exa-deep-research',
  description: 'Deep research with comprehensive context',
  inputSchema: z.object({
    prompts: z.array(z.string()).max(3).describe('3 complementary research prompts'),
  }),
  execute: async ({ context }) => {
    const results = await Promise.all(
      context.prompts.map(p => exa.deepResearch(p))
    );
    return results;
  },
});
```

### 3. GPT-5 Brutal Eval Tool
```typescript
export const gpt5BrutalEvalTool = createTool({
  id: 'gpt5-brutal-eval',
  description: 'Brutally evaluate post quality',
  inputSchema: z.object({
    post: z.string(),
  }),
  outputSchema: z.object({
    emotionalIntelligenceTest: z.boolean(),
    socialCapitalTest: z.boolean(),
    feedback: z.string(),
    score: z.number(),
  }),
  execute: async ({ context }) => {
    const evaluation = await gpt5.evaluate(context.post, {
      prompt: BRUTAL_EVAL_PROMPT,
    });
    return evaluation;
  },
});
```

---

## Workflows

### 1. Insight Discovery Workflow
```typescript
export const insightDiscoveryWorkflow = createWorkflow({
  id: 'insight-discovery',
  description: 'Recursive research to find viral-worthy insights',
  inputSchema: z.object({
    topic: z.string(),
    depth: z.number().default(3),
  }),
  outputSchema: z.object({
    insight: z.string(),
    supportingData: z.object({}),
    confidence: z.number(),
    suggestedFlavor: z.string(),
  }),
  steps: [
    topicGenerationStep,
    uniquenessCheckStep,
    recursiveResearchStep,
    insightValidationStep,
    flavorSelectionStep,
  ],
})
  .then(topicGenerationStep)
  .then(uniquenessCheckStep)
  .then(recursiveResearchStep)
  .then(insightValidationStep)
  .then(flavorSelectionStep)
  .commit();
```

### 2. Post Generation Workflow (Flavor-Aware)
```typescript
export const postGenerationWorkflow = createWorkflow({
  id: 'post-generation',
  description: 'Convert strong insight to viral post with flavor awareness',
  steps: [
    flavorConfigurationStep,
    hookGenerationStep,
    draftWritingStep,
    brutalEvaluationStep,
    revisionStep,
    polishStep,
    finalEvalStep,
  ],
})
  .then(flavorConfigurationStep)
  .then(hookGenerationStep)
  .then(draftWritingStep)
  .then(brutalEvaluationStep)
  .then(revisionStep)
  .then(polishStep)
  .then(finalEvalStep)
  .commit();
```

---

## Master Agent Network

```typescript
export const qsrMasterNetwork = new NewAgentNetwork({
  id: 'qsr-viral-post-network',
  name: 'QSR Viral Post Generation Network',
  agents: {
    // Stage 1 Agents
    topicGeneratorAgent,
    questionAgent,
    statsAgent,
    customQuestionAgent,
    contentPickerAgent,
    insightValidatorAgent,
    
    // Flavor System
    flavorOrchestratorAgent,
    
    // Stage 2 Agents
    hookValidatorAgent,
    draftAgent,
    revisionAgent,
    polishAgent,
  },
  workflows: {
    insightDiscoveryWorkflow,
    postGenerationWorkflow,
  },
  model: openai('gpt-4o'),
  memory: createInsightMemory(),
  instructions: `
    You orchestrate a two-stage viral post generation system.
    
    Stage 1: Discover unique insights through recursive research
    Stage 2: Transform insights into viral posts
    
    Ensure:
    - Zero duplicate insights (check memory)
    - Strong data backing (50+ queries per post)
    - Multiple post flavors
    - Viral quality (0.80+ score)
    
    For batch generation, ensure topic diversity across companies and angles.
  `,
});
```

---

## Batch Generation System

```typescript
export async function generateViralBatch(count: number = 30) {
  console.log(`🚀 Generating ${count} viral QSR posts with flavor diversity...`);
  
  // Ensure flavor diversity
  const flavorDistribution = {
    heavy_math_analysis: Math.ceil(count * 0.25),      // 7-8 posts
    deep_dual_situation: Math.ceil(count * 0.20),      // 6 posts
    crisis_storytelling: Math.ceil(count * 0.15),      // 4-5 posts
    detailed_comparison: Math.ceil(count * 0.20),      // 6 posts
    unit_economics_breakdown: Math.ceil(count * 0.20), // 6 posts
  };
  
  // Topic diversity enforcement
  const topicDiversityValidator = {
    maxPerCompany: 3,
    requiredCompanies: 10,
    requiredAngles: 5,
  };
  
  const posts = [];
  
  for (const [flavor, targetCount] of Object.entries(flavorDistribution)) {
    console.log(`📊 Generating ${targetCount} ${flavor} posts...`);
    
    const flavorPosts = await Promise.all(
      Array(targetCount).fill(0).map(() => 
        qsrMasterNetwork.generate(
          `Generate viral QSR insight optimized for ${flavor} post flavor`,
          { 
            resourceId: 'raghav',
            threadId: `${flavor}-${Date.now()}-${Math.random()}`,
            targetFlavor: flavor
          }
        )
      )
    );
    
    posts.push(...flavorPosts);
  }
  
  return {
    posts: posts,
    flavorBreakdown: flavorDistribution,
    metrics: calculateBatchMetrics(posts)
  };
}
```

---

## Configuration & Environment

```env
# .env
OPENAI_API_KEY=your-key
EXA_API_KEY=your-key

# Model Configuration
INSIGHT_MODEL=gpt-4o-mini  # For research (cheap)
DRAFT_MODEL=gpt-4o         # For writing (quality)
EVAL_MODEL=gpt-4o          # For evaluation (quality)
POLISH_MODEL=gpt-4o-mini   # For polish (cheap)

# Research Configuration
MAX_RESEARCH_DEPTH=5
MIN_INSIGHT_SCORE=0.80
MIN_POST_SCORE=0.85

# Memory Configuration
MEMORY_DB_PATH=qsr-insights-memory.db
SIMILARITY_THRESHOLD=0.85

# Batch Configuration
BATCH_SIZE=30
PARALLEL_LIMIT=10
```

---

## Integration with Existing Eval System

Your existing evaluation system (`src/mastra/evals/viral-quality-eval.ts`) will be integrated as the final quality gate:

```typescript
const finalEvalStep = createStep({
  id: 'final-eval',
  execute: async ({ inputData }) => {
    const { post } = inputData;
    
    // Run your master eval
    const result = await viralQualityEval.measure('', post);
    
    if (result.score < 0.80) {
      console.log(`❌ Post failed viral quality: ${result.score}`);
      return { 
        passed: false, 
        score: result.score,
        retry: true 
      };
    }
    
    console.log(`✅ Post passed viral quality: ${result.score}`);
    return { 
      passed: true, 
      score: result.score,
      signals: result.triggeredSignals 
    };
  }
});
```

---

## Safety Rails & Quality Control

### 1. Topic Diversity Enforcer
```typescript
const topicDiversityValidator = {
  maxPerCompany: 3,  // Max 3 posts per QSR brand
  requiredCompanies: 10, // At least 10 different brands
  requiredAngles: 5, // All 5 flavors must be used
};
```

### 2. Batch Checkpointing
```typescript
const batchProgress = {
  checkpoint: true,
  saveAfterEach: true,
  resumeOnFailure: true,
  progressFile: 'batch-progress.json'
};
```

### 3. Quality Circuit Breaker
```typescript
if (consecutiveFailures >= 3) {
  console.log("Quality dropping, manual review needed");
  return { posts: completed, issue: "quality_degradation" };
}
```

---

## Cost Analysis

### Per Post
- Exa Answer: 50 queries × $0.001 = $0.05
- Exa Deep Research: 3 queries × $0.01 = $0.03
- GPT-4o calls: ~10 × $0.01 = $0.10
- GPT-4o-mini calls: ~20 × $0.001 = $0.02
- GPT-5 eval: 1 × $0.15 = $0.15
- Embeddings: ~5 × $0.0001 = $0.0005

**Total per post: ~$0.35-0.40**

### Per Batch (30 posts)
**Total: ~$10.50-12.00**

---

## Implementation Timeline

### Day 1: Core Infrastructure (10 hours)
- [ ] Project setup and dependencies
- [ ] Memory system implementation
- [ ] Basic agent scaffolding
- [ ] Exa API integration

### Day 2: Stage 1 Implementation (10 hours)
- [ ] Topic generation and validation
- [ ] Recursive research agents
- [ ] Insight validation
- [ ] Uniqueness checking

### Day 3: Stage 2 Implementation (10 hours)
- [ ] Flavor system setup
- [ ] Draft and revision agents
- [ ] GPT-5 integration
- [ ] Polish and final eval

### Day 4: Testing & Refinement (10 hours)
- [ ] Single post test
- [ ] 5-post batch test
- [ ] Full 30-post batch
- [ ] Performance optimization

---

## Testing Strategy

### Phase 1: Unit Testing
- Test each agent individually
- Verify Exa API integration
- Check memory persistence

### Phase 2: Integration Testing
- Test insight discovery workflow
- Test post generation workflow
- Verify flavor selection

### Phase 3: Full System Testing
- Generate 1 post end-to-end
- Generate 5 posts with different flavors
- Generate full 30-post batch

---

## Success Metrics

### Must Have
- [ ] 30 posts generated in single run
- [ ] 80%+ score on viral quality eval
- [ ] Zero duplicate insights
- [ ] 5 different post flavors used

### Nice to Have
- [ ] 90%+ posts need no manual editing
- [ ] Average generation time < 5 min/post
- [ ] Cost < $0.40/post
- [ ] 95%+ pass GPT-5 brutal eval

---

## Risk Mitigation

### Technical Risks
- **API failures:** Implement retry logic and caching
- **Memory corruption:** Regular backups of memory DB
- **Quality degradation:** Circuit breakers and checkpoints

### Content Risks
- **Topic repetition:** Diversity validators
- **Voice consistency:** Few-shot examples from your posts
- **Factual errors:** Multiple validation steps

---

## Future Enhancements

### V2 Features
- Real-time market data integration
- Earnings call transcript analysis
- Competitive intelligence monitoring
- A/B testing different hooks

### V3 Features
- Multi-platform adaptation (Twitter, Reddit)
- Visual content generation
- Trend prediction
- Automated scheduling

---

## Notes & Reminders

1. **Start Simple:** Core pipeline first, add complexity gradually
2. **Test Often:** Validate each component before integration
3. **Monitor Costs:** Track API usage closely
4. **Preserve Voice:** Use your existing posts as training data
5. **Iterate Based on Results:** First batch won't be perfect

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your API keys

# Test single agent
npm run test:agent -- topic-generator

# Test workflow
npm run test:workflow -- insight-discovery

# Generate single post
npm run generate:single

# Generate batch
npm run generate:batch -- 30

# Check memory
npm run inspect:memory
```

---

## Contact & Support

Built for Raghav's QSR viral post generation.
Last Updated: November 2024

**Remember:** The goal is 30 viral-worthy posts in one run. Everything else is secondary.
