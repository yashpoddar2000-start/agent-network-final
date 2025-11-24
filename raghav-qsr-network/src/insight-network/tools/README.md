# Insight Network Tools

## Exa Answer Tool

Bulk research tool that processes multiple queries efficiently using Exa's Answer API.

### Testing

1. **Set up environment variables:**
   ```bash
   # Add to your .env file:
   EXA_API_KEY=your_exa_api_key_here
   ```

2. **Run the test:**
   ```bash
   npm run test:exa-answer
   ```

### Usage

```typescript
import { exaAnswerTool } from './exa-answer-tool';

const result = await exaAnswerTool.execute({
  context: {
    queries: [
      "What is Chick-fil-A's revenue per store?",
      "What is their employee turnover rate?",
      // ... up to 50 queries
    ],
    batchOptions: {
      maxConcurrency: 10,
      maxRetries: 3,
      timeoutMs: 30000,
    }
  }
});

console.log(result.summary); // Success/failure stats
console.log(result.results); // All answers with sources
```

### Features

- ✅ **Bulk processing:** 1-50 queries per call
- ✅ **Parallel execution:** Configurable concurrency
- ✅ **Retry logic:** Automatic retries with exponential backoff
- ✅ **Timeout handling:** Prevents hanging requests
- ✅ **Error graceful:** Partial results if some queries fail
- ✅ **Source extraction:** Includes citations and metadata



