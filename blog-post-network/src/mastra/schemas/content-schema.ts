import { z } from 'zod';

/**
 * Content Schema
 * 
 * General content validation and editing schemas
 * Used by editor and formatter agents
 * Reference: template-ai-storyboard-consistent-character/src/mastra/schemas/export-schema.ts
 */

// Content quality issues
export const ContentIssueSchema = z.object({
  type: z.enum(['grammar', 'spelling', 'clarity', 'structure', 'tone', 'seo']).describe('Type of issue'),
  severity: z.enum(['low', 'medium', 'high']).describe('Issue severity'),
  location: z.string().describe('Where the issue occurs'),
  suggestion: z.string().describe('Suggested fix'),
  originalText: z.string().optional().describe('Original problematic text'),
  suggestedText: z.string().optional().describe('Suggested replacement text'),
});

// Editing result
export const EditingResultSchema = z.object({
  originalContent: z.string().describe('Original content before editing'),
  editedContent: z.string().describe('Content after editing'),
  issues: z.array(ContentIssueSchema).describe('Issues found and fixed'),
  changesMade: z.array(z.string()).describe('List of changes made'),
  improvementScore: z.number().min(0).max(100).describe('How much content improved (0-100)'),
  timestamp: z.string().describe('When editing was performed'),
});

// Markdown formatting options
export const MarkdownFormattingSchema = z.object({
  includeTableOfContents: z.boolean().default(false).describe('Add table of contents'),
  includeMetadata: z.boolean().default(true).describe('Include frontmatter metadata'),
  codeHighlighting: z.boolean().default(true).describe('Enable code syntax highlighting'),
  addHeadingIds: z.boolean().default(false).describe('Add IDs to headings for linking'),
  formatting: z.enum(['github', 'standard', 'minimal']).default('standard').describe('Markdown flavor'),
});

// Formatted content output
export const FormattedContentSchema = z.object({
  content: z.string().describe('Formatted content'),
  format: z.enum(['markdown', 'html', 'plain']).describe('Output format'),
  metadata: z.record(z.string(), z.any()).optional().describe('Content metadata'),
  wordCount: z.number().describe('Total word count'),
  readingTime: z.string().describe('Estimated reading time'),
  exportPath: z.string().optional().describe('Path where content was saved'),
});

// Content validation result
export const ContentValidationSchema = z.object({
  isValid: z.boolean().describe('Whether content passes validation'),
  errors: z.array(z.string()).describe('Validation errors'),
  warnings: z.array(z.string()).describe('Validation warnings'),
  score: z.number().min(0).max(100).describe('Overall content quality score'),
  recommendations: z.array(z.string()).describe('Recommendations for improvement'),
});

// SEO metadata
export const SEOMetadataSchema = z.object({
  title: z.string().max(60).describe('SEO title (max 60 chars)'),
  description: z.string().max(160).describe('Meta description (max 160 chars)'),
  keywords: z.array(z.string()).describe('Target keywords'),
  slug: z.string().describe('URL-friendly slug'),
  canonicalUrl: z.string().optional().describe('Canonical URL'),
  ogImage: z.string().optional().describe('Open Graph image URL'),
});

// Export TypeScript types
export type ContentIssue = z.infer<typeof ContentIssueSchema>;
export type EditingResult = z.infer<typeof EditingResultSchema>;
export type MarkdownFormatting = z.infer<typeof MarkdownFormattingSchema>;
export type FormattedContent = z.infer<typeof FormattedContentSchema>;
export type ContentValidation = z.infer<typeof ContentValidationSchema>;
export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;

