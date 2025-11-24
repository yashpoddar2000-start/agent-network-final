# QSR Viral Post MVP - Day 1 Plan (80/20 Extraction)

## Goal
Generate **ONE high-quality viral post** that scores 0.80+ on your existing eval system. 

**Philosophy:** Simple architecture, maximum quality. We're taking only the proven, essential components from the master plan.

---

## Core Architecture (20% Complexity, 80% Value)

```
Simple 4-Step Pipeline:
1. Research Agent → Get data via Exa (your manual workflow)
2. Writer Agent → Draft post (with your examples)
3. GPT-5 Brutal Eval → Harsh reality check
4. Revision Loop → Keep improving until GPT-5 approves
```

**The Key Insight:** GPT-5's brutal evaluation IS your quality control. If it passes GPT-5, it's viral-worthy.

---

## Essential Components Only

### 1. Research Agent (Simplified)
Combines the best of topic generation + recursive research into ONE agent.

```typescript
// src/mastra/agents/research-agent.ts
import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';

export const researchAgent = new Agent({
  name: 'qsr-researcher',
  description: 'Finds viral-worthy QSR insights with deep research',
  instructions: `
    You are a QSR industry expert with 10+ years operating experience.
    
    Your job:
    1. Generate a unique, non-obvious insight about QSR companies
    2. Create 30-50 specific research questions for Exa Answer API
    3. Create 3 complementary prompts for Exa Deep Research
    
    Focus on ONE of these proven patterns:
    - Shocking number contrasts (2x+ difference)
    - Hidden mechanisms nobody talks about
    - Same parent, different outcomes
    - Crisis to comeback stories
    - Unit economics revelations
    
    Companies: Chipotle, McDonald's, Wingstop, Taco Bell, Subway, 
    Chick-fil-A, Pizza Hut, Starbucks, Din Tai Fung, etc.
    
    Output format:
    {
      "insight": "The core non-obvious insight",
      "hook": "The bold claim with specific numbers",
      "exaQueries": ["50 specific questions with 1-word answers"],
      "deepResearchPrompts": ["3 complementary research angles"],
      "suggestedFlavor": "heavy_math|comparison|storytelling"
    }
  `,
  model: openai('gpt-4o-mini'), // Cheap for research
  tools: {
    exaAnswerTool,
    exaDeepResearchTool,
  },
});
```

### 2. Writer Agent (Quality-Focused)
Takes research and writes using your EXACT style from successful posts.

```typescript
// src/mastra/agents/writer-agent.ts
export const writerAgent = new Agent({
  name: 'qsr-writer',
  description: 'Writes viral QSR posts in Raghav style',
  instructions: `
    You write viral LinkedIn posts about QSR industry insights.
    
    CRITICAL: Study these examples for voice and structure:
    - P054: Heavy math analysis (Chipotle franchise)
    - P053: Deep comparison (Taco Bell vs Pizza Hut)
    - P001: Control mechanisms (Chick-fil-A vs Subway)
    
    Writing rules:
    1. Start with shocking contrast or bold claim
    2. Use specific numbers in first line
    3. Build narrative with data points
    4. Reveal the "why" behind the numbers
    5. End with broader business principle
    
    Length: 200-300 words
    Style: Conversational but data-rich
    Tone: Confident, slightly contrarian
    
    AVOID:
    - Generic business speak
    - Obvious insights
    - Unsupported claims
    - Cringy hooks
  `,
  model: openai('gpt-4o'), // Quality for writing
  tools: {
    exampleLoader, // Loads your successful posts
  },
});
```

### 3. GPT-5 Brutal Evaluator (THE CRITICAL COMPONENT)
Your exact prompt that drives quality through brutal honesty.

```typescript
// src/mastra/agents/brutal-evaluator.ts
export const BRUTAL_EVAL_PROMPT = `You are a Senior Restaurant Industry Analyst with 15+ years of experience analyzing public restaurant companies. You have an MBA from Wharton, you've worked at McKinsey on restaurant turnarounds, and you currently advise PE firms on fast-casual acquisitions.

You read every 10-Q, every earnings transcript, and you know the unit economics of every major chain by heart.

Your job is to brutally analyze the LinkedIn post I'm about to show you. Be ruthless. If something is wrong, call it out. If the logic is weak, destroy it. If a number doesn't make sense, say so.

You are tired of surface-level restaurant analysis on LinkedIn that gets shared around by people who don't actually understand the industry.

After reading the post, answer these two questions with brutal honesty:

1. EMOTIONAL INTELLIGENCE TEST: Did this post make you feel smarter? Not "was it informative" - but did you feel that satisfying intellectual click where you understand something at a deeper level than before? Do you now feel confident walking into a conversation about fast-casual chains and holding your own? Would you feel GOOD about knowing this information? Be honest about whether it gave you that "aha" moment or if it felt like surface-level analysis you already knew.

2. SOCIAL CAPITAL TEST: Would you repost this to your professional network? Remember: you only share posts that make YOU look good. You share to signal that you have sophisticated taste, that you can spot quality analysis, that you're intellectually curious and discerning. Would sharing this post make you look smarter and more tasteful to your peers - or would it make you look like you're sharing mediocre content? Be brutally honest: does this post elevate your personal brand or dilute it?

For both questions, explain WHY with specific examples from the post. Don't be polite. Be the harsh critic who actually knows what good looks like.

OUTPUT FORMAT:
{
  "emotionalIntelligenceTest": true/false,
  "socialCapitalTest": true/false,
  "overallPass": true/false,
  "specificIssues": ["issue1", "issue2"],
  "specificStrengths": ["strength1", "strength2"],
  "recommendations": ["how to fix issue1", "how to fix issue2"],
  "brutalTruth": "One paragraph of unfiltered honest feedback"
}`;

export const brutalEvaluator = new Agent({
  name: 'gpt5-brutal-evaluator',
  description: 'Brutally honest post evaluation',
  instructions: BRUTAL_EVAL_PROMPT,
  model: openai('gpt-4o'), // Use gpt-4o until GPT-5 available
  outputSchema: z.object({
    emotionalIntelligenceTest: z.boolean(),
    socialCapitalTest: z.boolean(),
    overallPass: z.boolean(),
    specificIssues: z.array(z.string()),
    specificStrengths: z.array(z.string()),
    recommendations: z.array(z.string()),
    brutalTruth: z.string(),
  }),
});
```

### 4. Simple Orchestrator WITH GPT-5 Loop
The orchestrator now keeps iterating until GPT-5 is satisfied.

```typescript
// src/mastra/orchestrator.ts
export async function generateQSRPost(topic?: string) {
  console.log('🚀 Starting QSR post generation...');
  
  // Step 1: Research
  const research = await researchAgent.generate(
    topic || 'Find a viral QSR insight nobody has written about'
  );
  
  // Step 2: Execute Exa queries
  const exaData = await executeExaQueries(research.exaQueries);
  const deepData = await executeDeepResearch(research.deepResearchPrompts);
  
  // Step 3: Write initial draft
  let currentPost = await writerAgent.generate(
    `Write a viral post about: ${research.insight}`,
    {
      hook: research.hook,
      exaData: exaData,
      deepResearch: deepData,
      examples: loadExamplePosts([research.suggestedFlavor]),
    }
  );
  
  // Step 4: GPT-5 Brutal Evaluation Loop
  let attempts = 0;
  let brutalEval = await brutalEvaluator.generate(
    `Evaluate this post:\n\n${currentPost}`
  );
  
  while (!brutalEval.overallPass && attempts < 5) {
    console.log(`\n❌ GPT-5 REJECTED (Attempt ${attempts + 1}/5)`);
    console.log(`Issues: ${brutalEval.specificIssues.join(', ')}`);
    console.log(`Brutal Truth: ${brutalEval.brutalTruth}`);
    
    // Check if fundamentally weak topic
    if (brutalEval.brutalTruth.includes('fundamentally weak') || 
        brutalEval.brutalTruth.includes('boring insight')) {
      console.log('🔄 Topic is fundamentally weak. Starting over...');
      return generateQSRPost(); // Recursive call with new topic
    }
    
    // Otherwise, revise based on GPT-5 feedback
    currentPost = await writerAgent.generate(
      `Revise this post based on brutal feedback.
       
       CURRENT POST: ${currentPost}
       
       ISSUES TO FIX: ${brutalEval.specificIssues.join(', ')}
       
       RECOMMENDATIONS: ${brutalEval.recommendations.join(', ')}
       
       BRUTAL TRUTH: ${brutalEval.brutalTruth}
       
       Make it pass both the emotional intelligence and social capital tests.`,
      {
        exaData: exaData,
        deepResearch: deepData,
      }
    );
    
    // Re-evaluate
    brutalEval = await brutalEvaluator.generate(
      `Evaluate this post:\n\n${currentPost}`
    );
    attempts++;
  }
  
  // Step 5: Final check with your viral quality eval
  const viralScore = await viralQualityEval.measure('', currentPost);
  
  // Success or failure
  if (brutalEval.overallPass && viralScore.score >= 0.80) {
    console.log(`\n✅ SUCCESS! GPT-5 APPROVED!`);
    console.log(`Emotional Intelligence: ${brutalEval.emotionalIntelligenceTest}`);
    console.log(`Social Capital: ${brutalEval.socialCapitalTest}`);
    console.log(`Viral Score: ${viralScore.score}`);
  } else if (attempts >= 5) {
    console.log(`\n⚠️ Max attempts reached. Best effort post generated.`);
  }
  
  return {
    post: currentPost,
    brutalEval: brutalEval,
    viralScore: viralScore.score,
    signals: viralScore.triggeredSignals,
    attempts: attempts,
    research: research,
  };
}
```

---

## Exa Integration (Your Existing Tools)

### Simplified Exa Tools
```typescript
// src/mastra/tools/exa-tools.ts
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export const exaAnswerTool = createTool({
  id: 'exa-answer',
  description: 'Bulk research queries',
  inputSchema: z.object({
    queries: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // Run queries in batches of 10 for speed
    const results = [];
    for (let i = 0; i < context.queries.length; i += 10) {
      const batch = context.queries.slice(i, i + 10);
      const batchResults = await Promise.all(
        batch.map(q => exa.searchAndContents(q, { numResults: 1 }))
      );
      results.push(...batchResults);
    }
    return results;
  },
});

export const exaDeepResearchTool = createTool({
  id: 'exa-deep',
  description: 'Deep research prompts',
  inputSchema: z.object({
    prompts: z.array(z.string()).max(3),
  }),
  execute: async ({ context }) => {
    const results = await Promise.all(
      context.prompts.map(p => 
        exa.searchAndContents(p, { 
          numResults: 5,
          useAutoprompt: true,
        })
      )
    );
    return results;
  },
});
```

---

## Integration with Your Existing Eval

```typescript
// src/mastra/integration.ts
import { viralQualityEval } from './evals/viral-quality-eval';

// Your existing eval system stays exactly the same
// We just call it directly - no changes needed
```

---

## Example Loader (Critical for Quality)

```typescript
// src/mastra/tools/example-loader.ts
import { loadAllPosts } from './evals/utils/training-data';

export function loadExamplePosts(flavor: string) {
  const allPosts = loadAllPosts();
  
  // Get your best posts for this flavor
  const flavorMap = {
    'heavy_math': ['P054'], // Chipotle franchise
    'comparison': ['P053', 'P001'], // Taco Bell vs Pizza Hut
    'storytelling': ['P055'], // Starbucks China
  };
  
  return allPosts.filter(p => 
    flavorMap[flavor]?.includes(p.id)
  );
}
```

---

## Day 1 Implementation Steps

### Morning (2-3 hours): Setup
1. **Install only essential packages**
   ```bash
   npm install @mastra/core @ai-sdk/openai exa-js dotenv
   ```

2. **Create minimal file structure**
   ```
   src/
   ├── agents/
   │   ├── research-agent.ts
   │   └── writer-agent.ts
   ├── tools/
   │   ├── exa-tools.ts
   │   └── example-loader.ts
   ├── orchestrator.ts
   └── tok
   ```

3. **Set up .env**
   ```env
   OPENAI_API_KEY=your-key
   EXA_API_KEY=your-key
   ```

### Afternoon (3-4 hours): Core Implementation
1. Implement research agent (1 hour)
2. Implement writer agent (1 hour)
3. Set up Exa tools (30 min)
4. Build simple orchestrator (30 min)
5. Connect to existing eval system (1 hour)

### Evening (2-3 hours): Testing & Iteration
1. Generate first post
2. Check eval score
3. Debug and refine prompts
4. Generate 2-3 more test posts
5. Document what works/doesn't work

---

## Test Script

```typescript
// src/test-single-post.ts
import { generateQSRPost } from './orchestrator';
import * as fs from 'fs';

async function testSinglePost() {
  console.log('🧪 Testing single post generation...\n');
  
  const result = await generateQSRPost();
  
  console.log('\n📝 Generated Post:');
  console.log('─'.repeat(50));
  console.log(result.post);
  console.log('─'.repeat(50));
  
  console.log('\n📊 Evaluation:');
  console.log(`Score: ${result.score}`);
  console.log(`Signals: ${result.signals.join(', ')}`);
  
  // Save to file
  const filename = `output/post-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  console.log(`\n💾 Saved to ${filename}`);
  
  // Pass/Fail
  if (result.score >= 0.80) {
    console.log('\n✅ SUCCESS! Post is viral-worthy!');
  } else {
    console.log('\n❌ NEEDS WORK. Score below 0.80 threshold.');
  }
}

testSinglePost().catch(console.error);
```

---

## What We're NOT Building (Day 1)

❌ **Skipping for MVP:**
- Memory system (not needed for 1 post)
- Flavor orchestration (agent picks automatically)
- Complex workflows (simple function chain works)
- Batch generation (just 1 post)
- Uniqueness validation (not needed for 1 post)
- Multiple research strategies (agent handles it)
- Separate revision agent (writer agent can revise)
- Polish agent (writer does this too)
- Network orchestration (simple function)

✅ **Keeping (The Essential 20%):**
- Exa research (your core tool)
- **GPT-5 brutal eval (THE quality driver)**
- Your viral quality eval (additional validation)
- Example-based writing (your successful posts)
- Quality loop (revise until GPT-5 approves)

---

## Success Criteria (Day 1)

### Must Have
- [ ] Generate 1 complete post
- [ ] Score 0.80+ on viral quality eval
- [ ] Use real Exa data (not dummy)
- [ ] Match your writing style

### Nice to Have  
- [ ] Generate 3 different posts
- [ ] Try different topics/companies
- [ ] Document failure modes

---

## Day 2+ Expansion Path

Once Day 1 works, add from master plan in this order:

1. **Day 2:** Add memory for uniqueness checking
2. **Day 3:** Add flavor selection system
3. **Day 4:** Add GPT-5 brutal eval
4. **Day 5:** Build batch generation
5. **Week 2:** Full network orchestration

---

## Why This Will Work

1. **Proven Components Only**
   - Your Exa research process (works manually)
   - **Your GPT-5 brutal eval (the secret sauce)**
   - Your viral quality eval (additional validation)
   - Your example posts (proven viral)

2. **Simple Architecture**
   - 2 agents + 1 brutal evaluator
   - No complex routing
   - GPT-5 driven quality loop

3. **Quality Focus**
   - **Keep revising until GPT-5 approves**
   - Automatic topic restart if fundamentally weak
   - Both emotional intelligence AND social capital tests
   - Example-driven writing

4. **Fast Iteration**
   - See results in hours, not days
   - Learn what GPT-5 actually wants
   - Add complexity only where it helps

---

## Commands to Run

```bash
# Day 1 Morning
npm install
npm run build

# Day 1 Afternoon  
npm run test:single

# Day 1 Evening
npm run generate:post

# Check results
cat output/post-*.json | jq '.score'
```

---

## The 80/20 Insight

**We're keeping:**
- Your manual research process (Exa queries)
- **Your GPT-5 brutal evaluation (THE quality driver)**
- Your proven viral eval system (secondary check)
- Your successful post examples
- Quality-first approach with revision loops

**We're dropping (for now):**
- Complex orchestration
- Multiple specialized agents  
- Memory systems
- Fancy workflows
- Everything that isn't directly quality-related

**Result:** 20% of the complexity, 80% of the quality.

**The GPT-5 brutal eval is the ONE thing that ensures quality.** Everything else is just plumbing.

---

## Ready to Build?

This MVP will tell us in ONE DAY whether the core concept works. If we can generate one viral-worthy post, we can generate 30. If we can't, we'll know exactly why and can iterate quickly.

**Tomorrow's goal:** One post, 0.80+ score, real data, your voice.

Everything else is secondary.
