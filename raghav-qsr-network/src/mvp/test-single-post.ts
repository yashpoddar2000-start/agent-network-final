import 'dotenv/config';
import { generateQSRPost } from './orchestrator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Script - Generate Single QSR Post
 * 
 * Run this to generate one viral-worthy post end-to-end
 */

async function main() {
  const startTime = Date.now();
  
  try {
    // Generate the post
    const result = await generateQSRPost();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    // Display the final post
    console.log('\n' + '█'.repeat(80));
    console.log('📝 FINAL POST');
    console.log('█'.repeat(80));
    console.log('\n' + result.post + '\n');
    console.log('█'.repeat(80));
    
    // Display metrics
    console.log('\n📊 METRICS:');
    console.log(`   Generation Time: ${duration} minutes`);
    console.log(`   Revision Attempts: ${result.attempts}`);
    console.log(`   Viral Quality Score: ${result.viralScore.toFixed(2)}`);
    console.log(`   Exa Queries: ${result.exaDataSummary.queriesExecuted}`);
    console.log(`   Deep Research: ${result.exaDataSummary.deepResearchTopics} topics`);
    
    // Display evaluation details
    console.log('\n🔥 GPT-5 BRUTAL EVAL:');
    console.log(`   Emotional Intelligence: ${result.brutalEval.emotionalIntelligenceTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Social Capital: ${result.brutalEval.socialCapitalTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Overall: ${result.brutalEval.overallPass ? '✅ APPROVED' : '❌ REJECTED'}`);
    
    if (result.brutalEval.specificStrengths.length > 0) {
      console.log('\n   Strengths:');
      result.brutalEval.specificStrengths.forEach(s => console.log(`     • ${s}`));
    }
    
    if (result.brutalEval.specificIssues.length > 0) {
      console.log('\n   Remaining Issues:');
      result.brutalEval.specificIssues.forEach(i => console.log(`     • ${i}`));
    }
    
    console.log(`\n   Final Verdict: ${result.brutalEval.brutalTruth}`);
    
    // Display viral signals
    if (result.signals.length > 0) {
      console.log('\n🎯 TRIGGERED VIRAL SIGNALS:');
      result.signals.forEach(signal => console.log(`   ✓ ${signal}`));
    }
    
    // Save to file
    const outputDir = path.join(__dirname, '../../generated-output-mvp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `post_${result.research.suggestedFlavor}_${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify({
      post: result.post,
      metrics: {
        viralScore: result.viralScore,
        attempts: result.attempts,
        duration: `${duration} minutes`,
        signals: result.signals,
      },
      brutalEval: result.brutalEval,
      research: result.research,
      exaDataSummary: result.exaDataSummary,
      generatedAt: new Date().toISOString(),
    }, null, 2));
    
    console.log(`\n💾 Saved to: ${filepath}`);
    
    // Final verdict
    console.log('\n' + '='.repeat(80));
    if (result.viralScore >= 0.80 && result.brutalEval.overallPass) {
      console.log('🎉 SUCCESS! This post is VIRAL-WORTHY!');
    } else if (result.viralScore >= 0.75) {
      console.log('✅ GOOD! Post is high quality but could use minor refinement.');
    } else {
      console.log('⚠️  NEEDS WORK. Consider revising or trying a different topic.');
    }
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error generating post:', error);
    process.exit(1);
  }
}

main();

