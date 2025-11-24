import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import OpenAI from "openai";

// Initialize Exa client using OpenAI SDK with custom baseURL
const getExaClient = () => {
  if (!process.env.EXA_API_KEY) {
    throw new Error("EXA_API_KEY environment variable is required");
  }
  
  return new OpenAI({
    baseURL: "https://api.exa.ai",
    apiKey: process.env.EXA_API_KEY,
  });
};

// Types for Exa responses
interface ExaAnswerResult {
  query: string;
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    author?: string;
    publishedDate?: string;
    snippet?: string;
    image?: string;
    score?: number;
    id?: string;
    domain?: string;
  }>;
  error?: string;
}

/**
 * Bulk Exa Answer Tool for QSR Insight Research
 * 
 * Efficiently processes 10-50 research queries in parallel using Exa's Answer API.
 * Designed for the insight discovery network to gather comprehensive data.
 */
export const exaAnswerTool = createTool({
  id: "exa-bulk-answer",
  description: "Get answers to multiple QSR research questions efficiently using Exa Answer API. Use this for gathering comprehensive data about restaurant companies, financial metrics, and operational details.",
  
  inputSchema: z.object({
    queries: z
      .array(z.string())
      .min(1)
      .max(50)
      .describe("Array of research questions to answer (1-50 queries). Focus on specific, data-driven questions about QSR companies."),
    
    batchOptions: z.object({
      maxRetries: z.number().default(3).describe("Number of retries for failed queries"),
      timeoutMs: z.number().default(30000).describe("Timeout per query in milliseconds"),
      maxConcurrency: z.number().default(10).describe("Maximum parallel requests"),
    }).optional().describe("Optional configuration for batch processing"),
  }),

  outputSchema: z.object({
    results: z.array(z.object({
      query: z.string(),
      answer: z.string(),
      sources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        author: z.string().optional(),
        publishedDate: z.string().optional(),
        snippet: z.string().optional(),
        image: z.string().optional(),
        score: z.number().optional().describe("Exa relevance score for source quality filtering"),
        id: z.string().optional().describe("Unique source identifier"),
        domain: z.string().optional().describe("Extracted domain for credibility checking"),
      })),
      error: z.string().optional(),
    })),
    summary: z.object({
      totalQueries: z.number(),
      successful: z.number(),
      failed: z.number(),
      executionTimeMs: z.number(),
    }),
  }),

  execute: async ({ context }) => {
    const { queries, batchOptions } = context;
    const { 
      maxRetries = 3, 
      timeoutMs = 30000, 
      maxConcurrency = 10 
    } = batchOptions || {};

    const startTime = Date.now();
    console.log(`🔍 Starting bulk Exa research: ${queries.length} queries`);

    /**
     * Process a single query with retry logic
     */
    const processQuery = async (query: string): Promise<ExaAnswerResult> => {
      let lastError: string = "";
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          // Call Exa API using OpenAI SDK format
          const exaClient = getExaClient();
          const completion = await exaClient.chat.completions.create({
            model: "exa",
            messages: [
              {
                role: "user",
                content: query
              }
            ],
            stream: false, // We want the complete response
          }, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // Extract answer and sources from Exa response
          const message = completion.choices[0]?.message;
          if (!message?.content) {
            throw new Error("No answer returned from Exa API");
          }

          // Parse Exa's structured response
          const answer = message.content;
          
          // Extract sources from citations array (this is where Exa puts the sources!)
          const citations = (message as any).citations || [];
          const sources = citations.map((citation: any) => {
            const url = citation.url || "";
            
            // Extract domain for credibility filtering (e.g., "qsrmagazine.com")
            let domain: string | undefined;
            try {
              if (url) {
                const urlObj = new URL(url);
                domain = urlObj.hostname.replace(/^www\./, '');
              }
            } catch (error) {
              // Fallback: extract from URL string
              if (url) {
                const match = url.match(/https?:\/\/([^\/]+)/);
                domain = match ? match[1].replace(/^www\./, '') : undefined;
              }
            }
            
            return {
              title: citation.title || "Unknown title",
              url,
              author: citation.author,
              publishedDate: citation.publishedDate,
              snippet: citation.snippet,
              image: citation.image,
              score: citation.score, // Exa relevance score
              id: citation.id, // Unique identifier
              domain, // For quality filtering (blogs vs credible sources)
            };
          });

          return {
            query,
            answer,
            sources: sources.map((source: any) => ({
              title: source.title || "Unknown title",
              url: source.url || "",
              author: source.author,
              publishedDate: source.publishedDate,
            })),
          };

        } catch (error: any) {
          lastError = error.message || "Unknown error";
          
          if (attempt < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      return {
        query,
        answer: "",
        sources: [],
        error: `Failed after ${maxRetries} attempts: ${lastError}`,
      };
    };

    /**
     * Process queries in controlled batches to respect rate limits
     */
    const processBatch = async (batchQueries: string[]): Promise<ExaAnswerResult[]> => {
      return Promise.all(batchQueries.map(processQuery));
    };

    // Split queries into batches based on maxConcurrency
    const results: ExaAnswerResult[] = [];
    for (let i = 0; i < queries.length; i += maxConcurrency) {
      const batch = queries.slice(i, i + maxConcurrency);
      
      const batchResults = await processBatch(batch);
      results.push(...batchResults);
      
      // Small delay between batches to be respectful to API
      if (i + maxConcurrency < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Calculate summary stats
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    const executionTimeMs = Date.now() - startTime;

    console.log(`✅ Bulk research complete: ${successful}/${queries.length} successful (${executionTimeMs}ms)`);

    return {
      results,
      summary: {
        totalQueries: queries.length,
        successful,
        failed,
        executionTimeMs,
      },
    };
  },
});
