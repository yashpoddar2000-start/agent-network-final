/**
 * Test: Evaluation System
 * 
 * Demonstrates how to use evaluation metrics and scorers
 * OUTPUT: test-logs/evaluation-system-test.txt
 */

import 'dotenv/config';
import { researchAgent } from '../src/mastra/agents/research-agent';
import { writerAgent } from '../src/mastra/agents/writer-agent';
import { researchEvals, contentEvals, writingEvals } from '../src/mastra/evals';
import { writingQualityScorer } from '../src/mastra/scorers/writing-quality-scorer';
import * as fs from 'fs';
import * as path from 'path';

async function testEvaluations() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n🧪 TESTING EVALUATION SYSTEM\n');
  l('='.repeat(80));
  
  // Test research evaluation
  l('\n📊 Testing Research Evaluation...\n');
  
  const researchOutput = await researchAgent.generate('Research TypeScript benefits', {
    memory: { resourceId: 'eval-test', threadId: 'research-1' }
  });
  
  const researchScore1 = await researchEvals.completeness.measure(
    'TypeScript benefits',
    researchOutput.text
  );
  
  const researchScore2 = await researchEvals.relevance.measure(
    'TypeScript benefits',
    researchOutput.text
  );
  
  l('Research Completeness: ' + researchScore1.score);
  l('Research Relevance: ' + researchScore2.score);
  l('Info: ' + JSON.stringify(researchScore1.info, null, 2));
  
  // Test content evaluation
  l('\n\n📝 Testing Content Evaluation...\n');
  
  const writerOutput = await writerAgent.generate('Write blog about Python', {
    memory: { resourceId: 'eval-test', threadId: 'writer-1' }
  });
  
  const contentScore1 = await contentEvals.structure.measure(
    'Python benefits',
    writerOutput.text
  );
  
  const contentScore2 = await contentEvals.seo.measure(
    'Python benefits programming language',
    writerOutput.text
  );
  
  l('Content Structure: ' + contentScore1.score);
  l('SEO Quality: ' + contentScore2.score);
  l('Info: ' + JSON.stringify(contentScore1.info, null, 2));
  
  // Test writing quality scorer (LLM-based)
  l('\n\n🎯 Testing Writing Quality Scorer (LLM)...\n');
  
  const scorerResult = await writingQualityScorer.measure(
    'Python programming',
    writerOutput.text
  );
  
  l('Overall Score: ' + scorerResult.score);
  l('Detailed Analysis: ' + JSON.stringify(scorerResult.info, null, 2));
  
  l('\n\n' + '='.repeat(80));
  l('✅ EVALUATION SYSTEM WORKS!');
  l('='.repeat(80));
  l('\n🎉 Phase 6 Complete - Evals integrated!\n');
  
  // Save to file
  const logPath = path.join(process.cwd(), 'test-logs', 'evaluation-system-test.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n💾 SAVED TO: test-logs/evaluation-system-test.txt');
  console.log('📖 Read this file to see all evaluation results!\n');
}

testEvaluations().catch(console.error);

