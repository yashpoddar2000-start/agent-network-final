import Exa from 'exa-js';
import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Exa API Tools for Research
 * 
 * 1. Exa Answer: Bulk queries for specific data points (your 50 queries workflow)
 * 2. Exa Deep Research: Comprehensive research on complex topics
 */

const exa = new Exa(process.env.EXA_API_KEY || '');

// Exa Answer Tool - for bulk specific queries
export const exaAnswerTool = createTool({
  id: 'exa-answer-bulk',
  description: 'Execute bulk research queries to get specific data points (revenue, percentages, dates, etc.)',
  
  inputSchema: z.object({
    queries: z.array(z.string()).describe('Array of specific research questions'),
  }),
  
  outputSchema: z.object({
    results: z.array(z.object({
      query: z.string(),
      answer: z.string(),
      sources: z.array(z.string()),
    })),
    totalQueries: z.number(),
  }),
  
  execute: async ({ context }) => {
    console.log(`\n🔍 Executing ${context.queries.length} Exa Answer queries...`);
    
    const results = [];
    
    // Process queries in batches of 10 for rate limiting
    for (let i = 0; i < context.queries.length; i += 10) {
      const batch = context.queries.slice(i, i + 10);
      console.log(`   Processing queries ${i + 1}-${Math.min(i + 10, context.queries.length)}...`);
      
      const batchResults = await Promise.all(
        batch.map(async (query) => {
          try {
            const result = await exa.searchAndContents(query, {
              numResults: 1,
              useAutoprompt: true,
              type: 'keyword',
            });
            
            const answer = result.results[0]?.text || 'No answer found';
            const sources = result.results.map(r => r.url);
            
            return {
              query,
              answer: answer.substring(0, 500), // First 500 chars
              sources,
            };
          } catch (error) {
            console.error(`Error with query "${query}":`, error);
            return {
              query,
              answer: 'Error fetching data',
              sources: [],
            };
          }
        })
      );
      
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + 10 < context.queries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Completed ${results.length} queries`);
    
    return {
      results,
      totalQueries: results.length,
    };
  },
});

// Exa Deep Research Tool - for comprehensive research
export const exaDeepResearchTool = createTool({
  id: 'exa-deep-research',
  description: 'Perform deep research on complex topics with comprehensive context',
  
  inputSchema: z.object({
    prompts: z.array(z.string()).max(3).describe('Up to 3 complementary research prompts'),
  }),
  
  outputSchema: z.object({
    results: z.array(z.object({
      prompt: z.string(),
      findings: z.string(),
      sources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        excerpt: z.string(),
      })),
    })),
  }),
  
  execute: async ({ context }) => {
    console.log(`\n📚 Executing ${context.prompts.length} Exa Deep Research queries...`);
    
    const results = await Promise.all(
      context.prompts.map(async (prompt, index) => {
        console.log(`   Deep research ${index + 1}/${context.prompts.length}: "${prompt.substring(0, 60)}..."`);
        
        try {
          const result = await exa.searchAndContents(prompt, {
            numResults: 5,
            useAutoprompt: true,
            type: 'neural',
            text: true,
          });
          
          const sources = result.results.map(r => ({
            title: r.title || 'Untitled',
            url: r.url,
            excerpt: (r.text || '').substring(0, 300),
          }));
          
          const findings = result.results
            .map(r => r.text)
            .join('\n\n')
            .substring(0, 2000); // First 2000 chars
          
          return {
            prompt,
            findings,
            sources,
          };
        } catch (error) {
          console.error(`Error with deep research "${prompt}":`, error);
          return {
            prompt,
            findings: 'Error performing deep research',
            sources: [],
          };
        }
      })
    );
    
    console.log(`✅ Completed ${results.length} deep research queries`);
    
    return { results };
  },
});

// Helper function to execute research queries (for orchestrator)
export async function executeExaQueries(queries: string[]) {
  return await exaAnswerTool.execute({ context: { queries } });
}

export async function executeDeepResearch(prompts: string[]) {
  return await exaDeepResearchTool.execute({ context: { prompts } });
}

