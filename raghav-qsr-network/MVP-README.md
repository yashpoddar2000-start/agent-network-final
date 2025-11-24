# QSR Viral Post Generator - MVP

## 🚀 Quick Start

### 1. Set up your API keys

Create a `.env` file with:
```bash
OPENAI_API_KEY=your-openai-key
EXA_API_KEY=your-exa-key
```

### 2. Run the generator

```bash
npm run mvp:generate
```

That's it! The system will:
1. Generate a viral QSR insight
2. Research it with 30-50 Exa queries
3. Write a post in your style
4. Run brutal GPT-5 evaluation
5. Revise until it passes quality gates
6. Save the final post to `generated-output-mvp/`

## 📊 What It Does

### Research Agent
- Finds unique, non-obvious QSR insights
- Creates 30-50 specific research queries
- Plans 3 complementary deep research angles

### Exa Research
- Executes bulk queries for specific data points
- Performs deep research for comprehensive context
- Gathers financial data, unit economics, etc.

### Writer Agent
- Studies your successful posts (P001, P053, P054, P055, P058)
- Matches your voice and structure
- Uses research data to create data-rich posts

### GPT-5 Brutal Evaluator
- Runs your exact brutal evaluation prompt
- Tests emotional intelligence (does it make you smarter?)
- Tests social capital (would you share it?)
- Keeps revising until both tests pass

### Viral Quality Eval
- Final check with your existing eval system
- Must score 0.80+ to pass
- Validates leverage signals and anti-patterns

## 📁 Files Created

```
src/mvp/
├── agents/
│   ├── research-agent.ts      # Generates insights & research plan
│   ├── writer-agent.ts         # Writes in your style
│   └── brutal-evaluator.ts    # GPT-5 quality gate
├── tools/
│   ├── exa-tools.ts           # Exa API integration
│   └── example-loader.ts       # Loads your training data
├── orchestrator.ts             # Main coordination logic
└── test-single-post.ts         # Test script

generated-output-mvp/          # Output directory
└── post_*.json                # Generated posts with metrics
```

## 🎯 Success Criteria

A successful post must:
- ✅ Score 0.80+ on viral quality eval
- ✅ Pass GPT-5 emotional intelligence test
- ✅ Pass GPT-5 social capital test
- ✅ Use specific data points
- ✅ Match your voice

## 🔧 What's Next

Once this works:
1. **Day 2-3:** Add recursearch patterns for better insights
2. **Week 2:** Add memory system for uniqueness
3. **Week 2:** Add flavor diversity system
4. **Week 2:** Build batch generation for 30 posts

## 💡 Tips

- First post might take 5-10 minutes
- If topic is "fundamentally weak", system restarts automatically
- Max 5 revision attempts per post
- All posts saved with full metrics for analysis

## 🐛 Troubleshooting

**"No API key"**: Check your `.env` file
**"Agent not responding"**: Check OpenAI API status
**"Exa errors"**: Check Exa API key and rate limits
**"Low scores"**: Topic might be weak, try running again

## 📊 Expected Results

First run:
- 60-70% chance of getting 0.80+ score
- Will learn what works for future iterations

After 3-5 runs:
- Better understanding of what topics work
- Can tune prompts for consistency
- Ready to scale to multiple posts

