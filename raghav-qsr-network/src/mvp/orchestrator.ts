import { researchAgent } from './agents/research-agent';
import { writerAgent } from './agents/writer-agent';
import { brutalEvaluator } from './agents/brutal-evaluator';
import { executeExaQueries, executeDeepResearch } from './tools/exa-tools';
import { loadExamplePosts, formatExamplesForPrompt } from './tools/example-loader';
import { viralQualityEval } from '../mastra/evals/viral-quality-eval';

/**
 * QSR Post Generator - MVP Orchestrator
 * 
 * Simple function-based orchestration (no complex network yet)
 * Coordinates: Research → Exa Data → Writing → GPT-5 Loop → Viral Eval
 */

export interface GeneratedPost {
  post: string;
  brutalEval: {
    emotionalIntelligenceTest: boolean;
    socialCapitalTest: boolean;
    overallPass: boolean;
    specificIssues: string[];
    specificStrengths: string[];
    recommendations: string[];
    brutalTruth: string;
  };
  viralScore: number;
  signals: string[];
  attempts: number;
  research: {
    insight: string;
    hook: string;
    suggestedFlavor: string;
  };
  exaDataSummary: {
    queriesExecuted: number;
    deepResearchTopics: number;
  };
}

export async function generateQSRPost(topic?: string): Promise<GeneratedPost> {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 QSR VIRAL POST GENERATOR - MVP');
  console.log('='.repeat(80));
  
  // STEP 1: Research & Insight Generation
  console.log('\n📊 STEP 1: Generating insight and research plan...');
  
  const researchResult = await researchAgent.generate(
    topic || 'Generate a unique, viral-worthy QSR industry insight that nobody has written about. Focus on non-obvious angles with strong data support.'
  );
  
  // Parse the JSON response
  const researchPlan = JSON.parse(researchResult.text);
  
  console.log(`\n✅ Insight: ${researchPlan.insight}`);
  console.log(`✅ Hook: ${researchPlan.hook}`);
  console.log(`✅ Suggested Flavor: ${researchPlan.suggestedFlavor}`);
  console.log(`✅ Reasoning: ${researchPlan.reasoning}`);
  console.log(`✅ Research Queries: ${researchPlan.exaQueries.length} queries planned`);
  
  // STEP 2: Execute Exa Research
  console.log('\n🔬 STEP 2: Executing Exa research...');
  
  const [exaData, deepData] = await Promise.all([
    executeExaQueries(researchPlan.exaQueries),
    executeDeepResearch(researchPlan.deepResearchPrompts),
  ]);
  
  console.log(`✅ Exa Answer: ${exaData.totalQueries} queries completed`);
  console.log(`✅ Deep Research: ${deepData.results.length} comprehensive reports`);
  
  // STEP 3: Load Example Posts
  console.log('\n📚 STEP 3: Loading example posts for style matching...');
  
  const examplePosts = loadExamplePosts([researchPlan.suggestedFlavor]);
  const examplesFormatted = formatExamplesForPrompt(examplePosts);
  
  // STEP 4: Write Initial Draft
  console.log('\n✍️  STEP 4: Writing initial draft...');
  
  const writerContext = `
INSIGHT TO WRITE ABOUT:
${researchPlan.insight}

HOOK TO USE:
${researchPlan.hook}

POST FLAVOR: ${researchPlan.suggestedFlavor}

RESEARCH DATA SUMMARY:
${JSON.stringify(exaData.results.slice(0, 10), null, 2)}

DEEP RESEARCH FINDINGS:
${JSON.stringify(deepData.results, null, 2)}

EXAMPLE POSTS TO MATCH (study the voice and structure):
${examplesFormatted}

Write a viral post using this data. Match the voice and structure of the example posts.
`;
  
  const draftResult = await writerAgent.generate(writerContext);
  const currentDraft = JSON.parse(draftResult.text);
  let currentPost = currentDraft.post;
  
  console.log(`\n✅ Draft complete (${currentDraft.wordCount} words)`);
  console.log(`✅ Key numbers used: ${currentDraft.keyNumbers.join(', ')}`);
  
  // STEP 5: GPT-5 Brutal Evaluation Loop
  console.log('\n🔥 STEP 5: GPT-5 Brutal Evaluation Loop...');
  console.log('─'.repeat(80));
  
  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  let brutalEvalResult = await brutalEvaluator.generate(
    `Evaluate this LinkedIn post:\n\n${currentPost}`
  );
  let brutalEval = JSON.parse(brutalEvalResult.text);
  
  while (!brutalEval.overallPass && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    console.log(`\n❌ ATTEMPT ${attempts}/${MAX_ATTEMPTS} - GPT-5 REJECTED`);
    console.log(`   Emotional Intelligence: ${brutalEval.emotionalIntelligenceTest ? '✅' : '❌'}`);
    console.log(`   Social Capital: ${brutalEval.socialCapitalTest ? '✅' : '❌'}`);
    console.log(`\n   Issues: ${brutalEval.specificIssues.join(', ')}`);
    console.log(`\n   Brutal Truth: ${brutalEval.brutalTruth}`);
    
    // Check if topic is fundamentally weak
    if (brutalEval.brutalTruth.toLowerCase().includes('fundamentally weak') || 
        brutalEval.brutalTruth.toLowerCase().includes('boring insight') ||
        brutalEval.brutalTruth.toLowerCase().includes('surface-level')) {
      console.log('\n🔄 Topic is fundamentally weak. Starting over with new insight...');
      return generateQSRPost(); // Recursive call with new topic
    }
    
    // Revise based on feedback
    console.log('\n   🔧 Revising based on feedback...');
    
    const revisionContext = `
CURRENT POST:
${currentPost}

GPT-5 BRUTAL FEEDBACK:
Issues: ${brutalEval.specificIssues.join(', ')}
Recommendations: ${brutalEval.recommendations.join(', ')}
Brutal Truth: ${brutalEval.brutalTruth}

YOUR TASK:
Revise this post to pass BOTH tests:
1. Emotional Intelligence Test (make reader feel smarter)
2. Social Capital Test (make reader want to share)

Use the research data to add depth:
${JSON.stringify(exaData.results.slice(0, 5), null, 2)}

EXAMPLE POSTS (maintain this quality):
${examplesFormatted}

Revise the post to fix the issues while maintaining viral quality.
`;
    
    const revisedResult = await writerAgent.generate(revisionContext);
    const revised = JSON.parse(revisedResult.text);
    currentPost = revised.post;
    
    // Re-evaluate
    brutalEvalResult = await brutalEvaluator.generate(
      `Evaluate this LinkedIn post:\n\n${currentPost}`
    );
    brutalEval = JSON.parse(brutalEvalResult.text);
  }
  
  // STEP 6: Final Viral Quality Check
  console.log('\n📊 STEP 6: Final viral quality evaluation...');
  
  const viralResult = await viralQualityEval.measure('', currentPost);
  
  // Extract triggered signals from eval result
  const triggeredSignals: string[] = [];
  try {
    // Access metadata if it exists
    const resultAny = viralResult as any;
    if (resultAny.triggeredSignals) {
      triggeredSignals.push(...resultAny.triggeredSignals);
    } else if (resultAny.metadata?.triggeredSignals) {
      triggeredSignals.push(...resultAny.metadata.triggeredSignals);
    }
  } catch (e) {
    // Fallback to empty array if parsing fails
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 GENERATION COMPLETE');
  console.log('='.repeat(80));
  
  if (brutalEval.overallPass && viralResult.score >= 0.80) {
    console.log('\n✅ SUCCESS! Post passes all quality gates:');
    console.log(`   ✅ GPT-5 Emotional Intelligence: ${brutalEval.emotionalIntelligenceTest}`);
    console.log(`   ✅ GPT-5 Social Capital: ${brutalEval.socialCapitalTest}`);
    console.log(`   ✅ Viral Quality Score: ${viralResult.score.toFixed(2)}`);
    console.log(`   ✅ Triggered Signals: ${triggeredSignals.join(', ')}`);
  } else if (attempts >= MAX_ATTEMPTS) {
    console.log('\n⚠️  Max revision attempts reached. Best effort result:');
    console.log(`   GPT-5 Pass: ${brutalEval.overallPass}`);
    console.log(`   Viral Score: ${viralResult.score.toFixed(2)}`);
  } else {
    console.log('\n✅ Post generated but may need minor improvements:');
    console.log(`   Viral Score: ${viralResult.score.toFixed(2)}`);
  }
  
  return {
    post: currentPost,
    brutalEval: brutalEval,
    viralScore: viralResult.score,
    signals: triggeredSignals,
    attempts: attempts,
    research: {
      insight: researchPlan.insight,
      hook: researchPlan.hook,
      suggestedFlavor: researchPlan.suggestedFlavor,
    },
    exaDataSummary: {
      queriesExecuted: exaData.totalQueries,
      deepResearchTopics: deepData.results.length,
    },
  };
}

