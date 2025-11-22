# Viral Post Evaluation System

A custom evaluation system for assessing LinkedIn post quality based on 31 quality posts and 25 flop posts from Raghav's dataset.

## Overview

This eval system scores posts 0-1.0 for viral quality and provides detailed feedback on what's missing. Posts scoring **0.85+** are considered viral-worthy and ready to publish.

## Architecture

### Training Data
- **31 quality posts** (`hasViralElements: true`) - POSITIVE examples
- **25 flop posts** (`hasViralElements: false`) - NEGATIVE examples
- Each post includes expert analysis explaining what worked/didn't work

### Evaluation Types

#### 1. Leverage Signal Evals (7 total)
Positive signals that contribute to viral quality:

- **shocking-number-contrast-eval.ts** - Absurd number gaps ($8.5M vs $500K)
- **side-by-side-comparison-eval.ts** - Head-to-head competitor comparisons
- **contrarian-with-proof-eval.ts** - Challenges conventional wisdom with data
- **detailed-breakdown-eval.ts** - Forensic math showing HOW business works
- **reveals-hidden-mechanism-eval.ts** - Insider information (SEC filings, etc.)
- **comeback-story-eval.ts** - Crisis → solution → triumph narratives
- **david-vs-goliath-eval.ts** - Underdog beating giant stories

#### 2. Anti-Pattern Evals (3 total)
Quality filters that penalize poor content:

- **anti-cringy-hook-eval.ts** - Detects desperate hooks ("Did you know?")
- **broad-appeal-eval.ts** - Ensures universal business principles
- **forensic-detail-eval.ts** - Checks for depth vs surface-level

#### 3. Master Viral Quality Eval
Combines all evals into final score with intelligent weighting.

## How It Works

### LLM-Based Evaluation
Each eval uses GPT-4o with few-shot prompting:

1. **Load examples** - Filters quality/flop posts by relevant signal
2. **Build prompt** - Shows GPT positive and negative examples
3. **Compare** - GPT judges if new post resembles quality or flop examples
4. **Score** - Returns 0-1.0 score + detailed feedback

### Scoring Logic

```
Base score: 0.20

Signal contributions (weighted):
+ shocking_number_contrast: 0.15
+ detailed_breakdown: 0.15
+ side_by_side_comparison: 0.12
+ contrarian_with_proof: 0.12
+ reveals_hidden_mechanism: 0.10
+ comeback_story: 0.08
+ david_vs_goliath: 0.08

Anti-pattern penalties:
- cringy_hook: -0.30
- missing_broad_appeal: -0.25
- missing_forensic_detail: -0.20

Final Score: 0.0-1.0
Threshold: 0.85+ = viral-worthy
```

## Usage

### Testing Individual Eval

```typescript
import { shockingNumberContrastEval } from './mastra/evals';

const result = await shockingNumberContrastEval.measure('', postText);
console.log(result.score); // 0.0-1.0
console.log(result.info.reason); // Explanation
console.log(result.info.recommendations); // How to improve
```

### Testing Master Eval

```typescript
import { viralQualityEval } from './mastra/evals';

const result = await viralQualityEval.measure('', postText);
console.log(result.score); // Final score
console.log(result.info.isViralWorthy); // true/false
console.log(result.info.strengths); // What's working
console.log(result.info.weaknesses); // What's missing
console.log(result.info.recommendations); // How to improve
```

## Scripts

### Quick Test
Test individual and master evals on sample posts:
```bash
npm run test-eval
```

### Full Validation
Run master eval on all 56 posts to measure accuracy:
```bash
npm run validate-evals
```

Expected results:
- 31 quality posts should score >= 0.85 (90%+ accuracy target)
- 25 flop posts should score < 0.85 (90%+ accuracy target)

## Integration with Agent Network

Each eval maps directly to agent capabilities:

| Eval | Required Agent |
|------|---------------|
| shocking-number-contrast | Research Agent (finds absurd numbers) |
| side-by-side-comparison | Structure Agent (formats comparisons) |
| detailed-breakdown | Analysis Agent (calculates forensic math) |
| contrarian-with-proof | Insight Agent (finds counterintuitive angles) |
| reveals-hidden-mechanism | Research Agent (SEC filings, insider info) |
| comeback-story | Narrative Agent (crisis → triumph arcs) |
| david-vs-goliath | Story Agent (underdog narratives) |
| anti-patterns | Editor Agent (removes bad hooks, ensures quality) |

## Quality Loop

```
Generate Post
    ↓
Run viralQualityEval
    ↓
Score >= 0.85? → Publish ✓
    ↓
Score < 0.85? → Read recommendations → Retry (max 3x)
```

## Files Structure

```
src/mastra/evals/
├── README.md                              # This file
├── index.ts                               # Exports all evals
├── viral-quality-eval.ts                  # Master composite eval
├── shocking-number-contrast-eval.ts       # Signal eval
├── signals/                               # Leverage signal evals
│   ├── side-by-side-comparison-eval.ts
│   ├── contrarian-with-proof-eval.ts
│   ├── detailed-breakdown-eval.ts
│   ├── reveals-hidden-mechanism-eval.ts
│   ├── comeback-story-eval.ts
│   └── david-vs-goliath-eval.ts
├── anti-patterns/                         # Quality filter evals
│   ├── anti-cringy-hook-eval.ts
│   ├── broad-appeal-eval.ts
│   └── forensic-detail-eval.ts
└── utils/
    └── training-data.ts                   # Load examples from all-posts.json
```

## Environment Setup

Requires OpenAI API key:
```bash
export OPENAI_API_KEY=your_key_here
```

## Validation Results

After running `npm run validate-evals`, results are saved to:
```
data/eval-validation-results.json
```

Contains:
- Overall accuracy
- Per-post scores
- Misclassified posts for tuning

## Tuning the System

If accuracy is below 90%:

1. **Review misclassified posts** in validation results
2. **Adjust scoring weights** in `viral-quality-eval.ts`
3. **Refine prompts** in individual evals
4. **Add more examples** to few-shot prompts (increase from 5 to 7-8)
5. **Re-run validation** until 90%+ accuracy achieved

## Design Principles

1. **Timeless Base** - Compares to proven examples, not hardcoded rules
2. **LLM-Powered** - GPT learns patterns from your analyzed posts
3. **Modular** - Add/remove signal evals without changing base
4. **Actionable** - Feedback tells exactly what to add/fix
5. **Blueprint** - Maps directly to agent network architecture

## Next Steps

1. ✅ Build eval system (COMPLETE)
2. ⏭️ Validate on 56 posts (run `npm run validate-evals`)
3. ⏭️ Tune if accuracy < 90%
4. ⏭️ Build agent network based on eval structure
5. ⏭️ Integrate evals into generation loop
6. ⏭️ Generate 30 posts with 0.85+ quality guarantee

