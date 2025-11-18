import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { FormattedContentSchema, MarkdownFormattingSchema } from '../schemas/content-schema';
import fs from 'fs';
import path from 'path';

/**
 * Formatting Tool
 * 
 * Converts blog post content to markdown format and saves it.
 * Similar to template's pdf-export-tool.ts but for markdown.
 * 
 * Based on: template-ai-storyboard-consistent-character/src/mastra/tools/pdf-export-tool.ts
 */

export const formattingTool = createTool({
  id: 'format-to-markdown',
  description: 'Formats blog post content to markdown with metadata and saves it to file. Use this for final export.',
  
  inputSchema: z.object({
    content: z.string().describe('Blog post content to format'),
    title: z.string().describe('Post title'),
    metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata (author, date, tags)'),
    options: MarkdownFormattingSchema.optional().describe('Formatting options'),
  }),
  
  outputSchema: FormattedContentSchema,
  
  execute: async ({ context }) => {
    console.log('📄 [Formatting Tool] Starting markdown formatting...');
    console.log(`📋 [Formatting Tool] Title: ${context.title}`);
    console.log(`📊 [Formatting Tool] Content length: ${context.content.length} characters`);

    const { content, title, metadata = {}, options } = context;

    // Default options
    const includeMetadata = options?.includeMetadata ?? true;
    const includeTableOfContents = options?.includeTableOfContents ?? false;
    const formatting = options?.formatting ?? 'standard';

    // Build markdown document
    let markdownContent = '';

    // Add frontmatter metadata (YAML)
    if (includeMetadata) {
      console.log('📝 [Formatting Tool] Adding frontmatter metadata...');
      markdownContent += '---\n';
      markdownContent += `title: "${title}"\n`;
      
      if (metadata.author) markdownContent += `author: "${metadata.author}"\n`;
      if (metadata.date) markdownContent += `date: "${metadata.date}"\n`;
      if (metadata.category) markdownContent += `category: "${metadata.category}"\n`;
      if (metadata.tags && Array.isArray(metadata.tags)) {
        markdownContent += `tags: [${metadata.tags.map((t: string) => `"${t}"`).join(', ')}]\n`;
      }
      
      markdownContent += '---\n\n';
    }

    // Add title as H1
    markdownContent += `# ${title}\n\n`;

    // Add table of contents if requested
    if (includeTableOfContents) {
      console.log('📋 [Formatting Tool] Generating table of contents...');
      const headings = content.match(/^#{2,6}\s+.+$/gm) || [];
      if (headings.length > 0) {
        markdownContent += '## Table of Contents\n\n';
        headings.forEach(heading => {
          const level = heading.match(/^#+/)?.[0].length || 2;
          const text = heading.replace(/^#+\s+/, '');
          const indent = '  '.repeat(level - 2);
          const link = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          markdownContent += `${indent}- [${text}](#${link})\n`;
        });
        markdownContent += '\n';
      }
    }

    // Add main content
    markdownContent += content;

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readingMinutes = Math.ceil(wordCount / 200);
    const readingTime = `${readingMinutes} min read`;

    console.log(`📖 [Formatting Tool] Word count: ${wordCount}`);
    console.log(`⏱️ [Formatting Tool] Reading time: ${readingTime}`);

    // Save to file
    let exportPath: string | undefined;
    
    try {
      // Create output directory
      const projectRoot = process.cwd();
      const outputDir = path.join(projectRoot, 'generated-output');
      
      if (!fs.existsSync(outputDir)) {
        console.log(`📁 [Formatting Tool] Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate filename
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const timestamp = Date.now();
      const filename = `${safeTitle}_${timestamp}.md`;
      const filePath = path.join(outputDir, filename);

      console.log(`💾 [Formatting Tool] Saving to: ${filename}`);
      fs.writeFileSync(filePath, markdownContent, 'utf-8');
      
      exportPath = `generated-output/${filename}`;
      console.log(`✅ [Formatting Tool] File saved successfully!`);
    } catch (error) {
      console.error(`❌ [Formatting Tool] Failed to save file:`, error);
      // Continue without export path (don't fail the tool)
    }

    console.log(`✅ [Formatting Tool] Formatting complete!`);

    return {
      content: markdownContent,
      format: 'markdown' as const,
      metadata: {
        title,
        ...metadata,
        generatedAt: new Date().toISOString(),
      },
      wordCount,
      readingTime,
      exportPath,
    };
  },
});

