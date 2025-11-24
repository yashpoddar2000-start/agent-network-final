# QSR Viral Post Network - Complete Implementation Plan

## Executive Summary

A fully automated agent network that generates 30 viral-worthy LinkedIn posts about QSR (Quick Service Restaurants) in one batch run. The system reverse-engineers your manual workflow, integrates your custom evaluation system, and ensures zero duplicate insights through semantic memory.

**Goal:** Generate 30 viral posts (scoring 0.80+ on viral quality eval) with diverse flavors and zero manual intervention.

---

## Architecture Overview

### Two-Stage Network Design

```
Stage 1: Insight Discovery Network (RecurSearch Pattern)
├─ Topic Generation
├─ Recursive Research (Depth 3-5)
├─ Insight Validation
└─ Uniqueness Check

Stage 2: Post Generation Network (Your Manual Workflow)
├─ Flavor Selection
├─ Hook Generation
├─ Draft Writing
├─ Brutal Evaluation (GPT-5)
├─ Revision & Polish
└─ Final Evaluation
```

---

## Memory System for Strict Uniqueness

### Architecture
Based on the blog-post-network memory patterns, implementing comprehensive memory system that prevents ANY duplicate insights.

```typescript
// src/mastra/memory/insight-memory.ts
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';

export const createInsightMemory = () => {
  return new Memory({
    storage: new LibSQLStore({
      url: "file:qsr-insights-memory.db",
    }),
    vector: new LibSQLVector({
      connectionUrl: "file:qsr-insights-memory.db",
    }),
    embedder: openai.embedding('text-embedding-3-small'),
    options: {
      lastMessages: 100,
      semanticRecall: {
        topK: 10,
        messageRange: { before: 0, after: 0 },
        scope: 'resource',
      },
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# Generated Insights Tracker
        
## Statistics
- Total Insights Generated: 
- Unique Topics Covered:
- Companies Analyzed:
- Signals Used:

## Recent Insights (Last 30)
[List of recent insights with scores]

## Rejected Duplicates
[Insights rejected for similarity]
`,
      },
    },
  });
};
```

### Uniqueness Validator

```typescript
export class InsightUniquenessValidator {
  private memory: Memory;
  private existingPosts: Post[]; // Your 56 posts
  
  async validateUniqueness(newInsight: string): Promise<{
    isUnique: boolean;
    similarity: number;
    mostSimilar: string;
    reason: string;
  }> {
    // Check against existing 56 posts
    const existingSimilarity = await this.checkExistingPosts(newInsight);
    if (existingSimilarity > 0.85) {
      return {
        isUnique: false,
        similarity: existingSimilarity,
        mostSimilar: this.findMostSimilarPost(newInsight),
        reason: 'Too similar to existing published post'
      };
    }
    
    // Check against previously generated insights in memory
    const memorySimilarity = await this.checkMemoryInsights(newInsight);
    if (memorySimilarity > 0.85) {
      return {
        isUnique: false,
        similarity: memorySimilarity,
        mostSimilar: await this.findMostSimilarInMemory(newInsight),
        reason: 'Already generated this insight in current session'
      };
    }
    
    // Add to memory for future checks
    await this.addToMemory(newInsight);
    
    return {
      isUnique: true,
      similarity: Math.max(existingSimilarity, memorySimilarity),
      mostSimilar: '',
      reason: 'Unique insight'
    };
  }
}
```

---

## Modular Research Strategy System

### Configuration-Driven Research

```typescript
// src/config/research-strategies.json
{
  "strategies": {
    "shocking_number_contrast": {
      "name": "Shocking Number Discovery",
      "description": "Find absurd contrasts between QSR companies",
      "depth": 3,
      "agents": ["statsAgent", "questionAgent"],
      "tools": ["exaAnswer", "exaDeepResearch"],
      "questionTypes": ["percentage", "revenue", "margin", "growth"],
      "validationCriteria": {
        "requireNumbers": true,
        "minContrast": 2.0,
        "requireComparison": true
      },
      "prompts": {
        "initial": "Find shocking financial contrasts between {company1} and {company2}",
        "followUp": "What explains this {X}x difference?",
        "validation": "Is the contrast surprising enough?"
      }
    },
    
    "hidden_mechanism": {
      "name": "Hidden Mechanism Discovery",
      "description": "Uncover non-obvious business dynamics",
      "depth": 5,
      "agents": ["questionAgent", "contentPickerAgent"],
      "tools": ["exaDeepResearch"],
      "questionTypes": ["regulatory", "strategic", "operational", "franchise"],
      "validationCriteria": {
        "requireSources": ["SEC", "10-K", "earnings"],
        "requireMechanism": true
      }
    },
    
    "contrarian_angle": {
      "name": "Contrarian Insight Discovery",
      "description": "Challenge conventional wisdom with data",
      "depth": 4,
      "agents": ["questionAgent", "statsAgent"],
      "tools": ["exaAnswer"],
      "questionTypes": ["belief-challenge", "counter-narrative"],
      "validationCriteria": {
        "requireProof": true,
        "minControversy": 0.7
      }
    }
  }
}
```

### Dynamic Research Orchestrator

```typescript
// src/mastra/agents/research-orchestrator.ts
export class ResearchOrchestrator {
  private strategies: Map<string, ResearchStrategy>;
  
  async executeStrategy(
    strategyName: string, 
    context: ResearchContext
  ): Promise<ResearchResult> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) throw new Error(`Unknown strategy: ${strategyName}`);
    
    console.log(`🔬 Executing strategy: ${strategy.name}`);
    console.log(`   Depth: ${strategy.depth}`);
    console.log(`   Tools: ${strategy.tools.join(', ')}`);
    
    let depth = 0;
    let insights = {};
    let data = {};
    
    while (depth < strategy.depth) {
      // Generate questions based on strategy
      const questions = await this.generateQuestions(
        strategy.questionTypes,
        context,
        depth
      );
      
      // Use configured tools
      for (const toolName of strategy.tools) {
        const tool = this.getTool(toolName);
        const results = await tool.execute({ questions });
        data[`${toolName}_depth_${depth}`] = results;
      }
      
      // Validate based on strategy criteria
      const validation = await this.validate(
        data,
        strategy.validationCriteria
      );
      
      if (validation.passed) {
        console.log(`✅ Strategy criteria met at depth ${depth}`);
        break;
      }
      
      depth++;
    }
    
    return { insights, data, depth, strategy: strategyName };
  }
  
  // Hot reload strategies without restarting
  async reloadStrategies() {
    this.strategies = this.loadStrategies();
    console.log(`🔄 Reloaded ${this.strategies.size} strategies`);
  }
  
  // Add new strategy at runtime
  async addStrategy(name: string, config: ResearchStrategy) {
    this.strategies.set(name, config);
    await this.saveStrategies();
    console.log(`➕ Added new strategy: ${name}`);
  }
}
```

---

## Flavor System Architecture

### Post Flavor Profiles

The network supports multiple post flavors that adapt dynamically based on the insight type and available data.

```typescript
// src/config/flavor-profiles.ts
export const flavorProfiles = {
  heavy_math_analysis: {
    name: "Heavy Math Financial Analysis",
    researchFocus: "unit_economics, margins, revenue_calculations",
    requiredDataTypes: ["revenue_per_store", "profit_margins", "roic", "payback_period"],
    writingStructure: {
      hook: "shocking_financial_contrast",
      body: ["unit_economics_breakdown", "calculation_blocks", "margin_analysis"],
      conclusion: "financial_principle"
    },
    examplePosts: ["P054"], // Chipotle franchise refusal
    validationCriteria: {
      requireMath: true,
      minNumberCount: 8,
      requireCalculations: true
    }
  },

  deep_dual_situation: {
    name: "Deep Dual Situation Analysis",
    researchFocus: "comparative_analysis, operational_differences",
    requiredDataTypes: ["same_context_different_results", "operational_metrics"],
    writingStructure: {
      hook: "same_parent_different_results",
      body: ["situation_a_forensics", "situation_b_forensics", "mechanism_explanation"],
      conclusion: "universal_business_principle"
    },
    examplePosts: ["P053"], // Taco Bell vs Pizza Hut
  },

  crisis_storytelling: {
    name: "Crisis Timeline Storytelling",
    researchFocus: "chronological_events, causation_chains, resolution",
    requiredDataTypes: ["timeline_data", "turning_points", "outcome_metrics"],
    writingStructure: {
      hook: "crisis_to_current_state",
      body: ["timeline_progression", "crisis_details", "resolution_mechanism"],
      conclusion: "lessons_learned"
    },
    examplePosts: ["P055"], // Starbucks China crisis
  },

  detailed_comparison: {
    name: "Detailed Control Mechanism Comparison",
    researchFocus: "control_mechanisms, franchise_models, operational_differences",
    requiredDataTypes: ["franchise_structures", "control_systems", "outcome_metrics"],
    writingStructure: {
      hook: "absurd_performance_gap",
      body: ["company_a_mechanisms", "company_b_mechanisms", "gap_explanation"],
      conclusion: "control_principle"
    },
    examplePosts: ["P001"], // Chick-fil-A vs Subway
  },

  unit_economics_breakdown: {
    name: "Unit Economics Deep Dive",
    researchFocus: "fixed_costs, variable_costs, throughput_analysis",
    requiredDataTypes: ["revenue_calculations", "cost_structure", "volume_metrics"],
    writingStructure: {
      hook: "absurd_revenue_per_unit",
      body: ["revenue_breakdown", "cost_analysis", "leverage_explanation"],
      conclusion: "scalability_principle"
    },
    examplePosts: ["P058"], // Din Tai Fung $27.4M
  }
};
```

### Flavor Orchestrator Agent

```typescript
// src/mastra/agents/flavor-orchestrator-agent.ts
export const flavorOrchestratorAgent = new Agent({
  name: 'flavor-orchestrator',
  instructions: `
    You determine the optimal post flavor based on insight data and configure the entire pipeline.
    
    Analyze insight data and select from available flavors:
    - heavy_math_analysis: Financial breakdowns with calculations
    - deep_dual_situation: Side-by-side company comparisons
    - crisis_storytelling: Timeline narratives with turning points
    - detailed_comparison: Control mechanism analysis
    - unit_economics_breakdown: Fixed cost leverage analysis
    
    Output:
    {
      selectedFlavor: "flavor_key",
      confidence: 0.0-1.0,
      researchInstructions: "Specific research focus",
      writingInstructions: "Specific writing approach",
      requiredDataTypes: ["data_type_1", "data_type_2"],
      alternativeFlavors: ["backup_flavor_1", "backup_flavor_2"]
    }
  `,
  model: openai('gpt-4o'),
});
```

---

## Stage 1: Insight Discovery Network

### Agents for Stage 1

#### 1.1 Topic Generator Agent
```typescript
export const topicGeneratorAgent = new Agent({
  name: 'topic-generator',
  description: 'Generates diverse QSR insights that no one has thought about',
  instructions: `
    Generate unique QSR industry insights that:
    - Challenge conventional wisdom
    - Reveal hidden mechanisms
    - Show shocking contrasts
    - Uncover non-obvious patterns
    
    Focus on companies: Chipotle, McDonald's, Wingstop, Chili's, Taco Bell, 
    Subway, Chick-fil-A, Pizza Hut, Starbucks, Din Tai Fung, etc.
    
    Think like a restaurant operator with 10+ years experience.
    Look for insights others miss.
  `,
  model: openai('gpt-4o-mini'),
});
```

#### 1.2 Question Agent (RecurSearch Pattern)
```typescript
export const questionAgent = new Agent({
  name: 'question-agent',
  instructions: `
    Generate precise research questions that drill into specific aspects.
    Each question should be answerable with data/numbers.
    Focus on percentage, revenue, margins, growth rates.
  `,
  model: openai('gpt-4o-mini'),
});
```

#### 1.3 Stats Agent
```typescript
export const statsAgent = new Agent({
  name: 'stats-agent',
  instructions: `
    Generate statistical research questions that elicit percentage-based responses.
    Focus on measurable, objective metrics.
  `,
  model: openai('gpt-4o-mini'),
});
```

#### 1.4 Custom Question Agent
```typescript
export const customQuestionAgent = new Agent({
  name: 'custom-question-agent',
  instructions: `
    Generate follow-up questions based on initial research findings.
    Identify gaps and drill deeper into surprising discoveries.
  `,
  model: openai('gpt-4o-mini'),
});
```

#### 1.5 Content Picker Agent
```typescript
export const contentPickerAgent = new Agent({
  name: 'content-picker',
  instructions: `
    Analyze research results and identify the most viral-worthy insights.
    Score based on surprise factor, data support, and narrative potential.
  `,
  model: openai('gpt-4o'),
});
```

#### 1.6 Insight Validator Agent
```typescript
export const insightValidatorAgent = new Agent({
  name: 'insight-validator',
  instructions: `
    Validate insight strength AND determine optimal post flavor.
    Score 0-1 based on:
    - Data availability
    - Surprise factor
    - Viral potential
    - Supporting evidence
    
    Also select optimal flavor based on available data.
  `,
  model: openai('gpt-4o'),
});
```

---

## Stage 2: Post Generation Network

### Agents for Stage 2

#### 2.1 Hook Validator Agent
```typescript
export const hookValidatorAgent = new Agent({
  name: 'hook-validator',
  instructions: `
    Evaluate and refine hooks for maximum impact.
    Ensure hook contains bold, factually-supported claim.
    Check against anti-cringy patterns.
  `,
  model: openai('gpt-4o'),
});
```

#### 2.2 Draft Agent (Flavor-Aware)
```typescript
export const draftAgent = new Agent({
  name: 'qsr-draft-writer',
  instructions: `
    Write posts using the specified FLAVOR_PROFILE structure.
    
    You will receive:
    - FLAVOR_PROFILE with writing structure
    - RESEARCH_DATA organized for that flavor
    - EXAMPLE_POSTS for reference
    
    Adapt your writing completely based on flavor:
    
    For heavy_math_analysis:
    - Lead with shocking financial contrast
    - Include calculation blocks
    - Show unit economics breakdown
    
    For deep_dual_situation:
    - Same context, different results hook
    - Side-by-side forensic breakdown
    - Mechanism explanation
    
    [Continue for all flavors...]
  `,
  model: openai('gpt-4o'),
  tools: {
    flavorExampleTool,
  },
});
```

#### 2.3 Revision Agent
```typescript
export const revisionAgent = new Agent({
  name: 'qsr-revision-agent',
  instructions: `
    Revise posts based on GPT-5 brutal feedback.
    Address specific criticisms while maintaining viral elements.
    Ensure data accuracy and logical flow.
  `,
  model: openai('gpt-4o'),
});
```

#### 2.4 Polish Agent
```typescript
export const polishAgent = new Agent({
  name: 'qsr-polish-agent',
  instructions: `
    Final polish for readability and virality.
    - Cut length to LinkedIn limits
    - Simplify for 18-year-old economics freshman
    - Remove cringe phrases
    - Enhance clarity without losing sophistication
  `,
  model: openai('gpt-4o-mini'),
});
```

---

## Tools

### 1. Exa Answer Tool
```typescript
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
