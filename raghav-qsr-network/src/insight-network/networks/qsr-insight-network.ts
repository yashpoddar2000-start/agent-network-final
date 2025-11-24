import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { openai } from '@ai-sdk/openai';
import { deepResearchPromptAgent, researchOrchestratorAgent } from '../agents';
import { createNetworkMemory } from '../memory';
import { RuntimeContext } from '@mastra/core/runtime-context';

/**
 * QSR Insight Discovery Network
 * 
 * Minimal network that orchestrates our solid research primitives to discover viral insights.
 * Focus: 80/20 principle - insight quality drives 80% of engagement.
 */
export const qsrInsightNetwork = new NewAgentNetwork({
  id: 'qsr-insight-network',
  name: 'QSR Insight Discovery Network',
  
  instructions: `
    Your job: Find viral QSR insights with 8+ shock factor by coordinating specialized agents.
    
    AVAILABLE AGENTS:
    - researchOrchestratorAgent: Has Exa research tools, executes data gathering
    - deepResearchPromptAgent: Generates expert deep research prompts
    
    VIRAL INSIGHT PATTERN (from 5 viral posts):
    1. SHOCKING HOOK (40% of engagement):
       - Numerical contrasts: "$9.3M vs $600K" (15x+ gaps)
       - Absurd numbers: "$27.4M per restaurant"
       - Same company paradoxes: "Same parent, different performance"
    
    2. NON-OBVIOUS MECHANISM (25% of engagement):
       - Hidden insights: "Closes Sundays = $1B sacrifice"
       - Calculated mechanisms: "5% vs 100% turnover = retention advantage"
       - Control structures: "Franchise selectivity = quality control"
    
    3. FORENSIC DATA (15% of engagement):
       - Unit economics: Specific margins, costs, ratios
       - Source citations: SEC filings, earnings, franchise documents
    
    COORDINATION PROCESS:
    1. Generate 2-3 hypotheses about shocking QSR contrasts
    2. Use researchOrchestratorAgent to gather initial data (10-15 specific queries)
    3. If promising gap found (5x+ difference):
       - Use deepResearchPromptAgent to craft expert research prompt
       - Use researchOrchestratorAgent to execute deep research
    4. Calculate shock score (10x+ gap = 9-10 points)
    5. Output structured insight if score >= 8
    
    AGENT COORDINATION:
    - researchOrchestratorAgent knows query specificity requirements
    - researchOrchestratorAgent enforces API limits (max 20 answer queries, max 3 deep research)
    - deepResearchPromptAgent generates expert prompts when needed
    
    ROUTING DECISIONS:
    - Need data gathering? → Use researchOrchestratorAgent
    - Need expert prompt? → Use deepResearchPromptAgent  
    - Need comprehensive analysis? → deepResearchPromptAgent then researchOrchestratorAgent
    
    TARGET COMPANIES:
    Chick-fil-A, McDonald's, Chipotle, Taco Bell, Subway, Wingstop,
    Pizza Hut, Starbucks, Din Tai Fung, Shake Shack, KFC
    
    FOCUS AREAS:
    - Same parent company paradoxes (Taco Bell vs Pizza Hut under Yum!)
    - Revenue per store gaps (find 5x+ differences)
    - Operational advantages (turnover, efficiency, service times)
    - Contrarian strategies (Chick-fil-A Sundays, In-N-Out no franchising)
    
    OUTPUT REQUIREMENT:
    Generate a structured insight with:
    - Hook (shocking numerical contrast)
    - Mechanism (why the gap exists)
    - Supporting data (specific numbers, percentages)
    - Sources (credible citations)
    - Shock score (0-10, target 8+)
  `,
  
  model: openai('gpt-4o'),
  memory: createNetworkMemory(),
  agents: { 
    researchOrchestratorAgent,
    deepResearchPromptAgent 
  },
});
