import { z } from 'zod';

/**
 * Blog Post Schema
 * 
 * Based on template's storyboard-schema.ts pattern but simplified for blog posts
 * Reference: template-ai-storyboard-consistent-character/src/mastra/schemas/storyboard-schema.ts
 */

// Blog post metadata
export const BlogPostMetadataSchema = z.object({
  title: z.string().min(1).describe('Blog post title'),
  author: z.string().optional().describe('Author name'),
  category: z.string().describe('Content category (e.g., Technology, Food, Business)'),
  tags: z.array(z.string()).describe('Content tags for SEO'),
  targetAudience: z.string().describe('Target audience description'),
  createdAt: z.string().describe('Creation timestamp'),
  wordCount: z.number().min(0).optional().describe('Total word count'),
  estimatedReadTime: z.string().optional().describe('Estimated reading time (e.g., "5 min read")'),
});

// Individual section of a blog post
export const BlogSectionSchema = z.object({
  sectionNumber: z.number().min(1).describe('Section number in sequence'),
  heading: z.string().describe('Section heading'),
  content: z.string().min(10).describe('Section content'),
  keyPoints: z.array(z.string()).optional().describe('Key points or takeaways from this section'),
});

// Complete blog post structure
export const BlogPostSchema = z.object({
  metadata: BlogPostMetadataSchema.describe('Blog post metadata'),
  hook: z.string().min(10).describe('Opening hook to grab attention'),
  introduction: z.string().min(20).describe('Introduction paragraph'),
  sections: z.array(BlogSectionSchema).min(1).describe('Main content sections'),
  conclusion: z.string().min(20).describe('Conclusion paragraph'),
  callToAction: z.string().optional().describe('Call to action for readers'),
});

// Blog post generation input
export const BlogPostInputSchema = z.object({
  topic: z.string().min(3).describe('Topic to write about'),
  style: z.enum(['professional', 'casual', 'technical', 'storytelling']).default('professional').describe('Writing style'),
  length: z.enum(['short', 'medium', 'long']).default('medium').describe('Desired length'),
  targetAudience: z.string().optional().describe('Specific audience to target'),
  keywords: z.array(z.string()).optional().describe('Keywords to include for SEO'),
  tone: z.enum(['informative', 'persuasive', 'entertaining', 'educational']).default('informative').describe('Tone of the content'),
});

// Blog post quality analysis
export const BlogPostAnalysisSchema = z.object({
  readabilityScore: z.number().min(0).max(100).describe('Readability score (0-100)'),
  seoScore: z.number().min(0).max(100).describe('SEO optimization score (0-100)'),
  engagementPotential: z.number().min(0).max(10).describe('Predicted engagement potential (0-10)'),
  strengths: z.array(z.string()).describe('Content strengths'),
  improvements: z.array(z.string()).describe('Suggested improvements'),
  keywordsUsed: z.array(z.string()).describe('Keywords found in content'),
});

// Export TypeScript types
export type BlogPostMetadata = z.infer<typeof BlogPostMetadataSchema>;
export type BlogSection = z.infer<typeof BlogSectionSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;
export type BlogPostAnalysis = z.infer<typeof BlogPostAnalysisSchema>;

