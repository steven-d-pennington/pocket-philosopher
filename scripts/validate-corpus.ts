#!/usr/bin/env npx tsx

/**
 * Corpus Validation Script
 *
 * Validates the integrity and quality of the philosophy corpus
 * Checks for duplicates, missing data, and content quality metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

interface CorpusWork {
  title: string;
  author: string;
  tradition: string;
  era?: string;
  sections: CorpusSection[];
}

interface CorpusSection {
  title: string;
  content: string;
  virtue: string;
  persona_tags: string[];
  key_concepts?: string[];
  applications?: string[];
}

interface CorpusData {
  works: CorpusWork[];
}

interface ValidationResult {
  totalWorks: number;
  totalSections: number;
  totalContentLength: number;
  averageSectionLength: number;
  traditions: string[];
  virtues: string[];
  personaTags: string[];
  issues: ValidationIssue[];
  qualityMetrics: QualityMetrics;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  work?: string;
  section?: string;
}

interface QualityMetrics {
  contentLengthDistribution: { short: number; medium: number; long: number };
  traditionCoverage: Record<string, number>;
  virtueBalance: Record<string, number>;
  averageSectionsPerWork: number;
}

async function validateCorpus(): Promise<ValidationResult> {
  const corpusPath = path.join(process.cwd(), 'data', 'corpus', 'philosophy-corpus.json');

  if (!fs.existsSync(corpusPath)) {
    throw new Error(`Corpus file not found: ${corpusPath}`);
  }

  const corpus: CorpusData = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

  const result: ValidationResult = {
    totalWorks: corpus.works.length,
    totalSections: 0,
    totalContentLength: 0,
    averageSectionLength: 0,
    traditions: [],
    virtues: [],
    personaTags: [],
    issues: [],
    qualityMetrics: {
      contentLengthDistribution: { short: 0, medium: 0, long: 0 },
      traditionCoverage: {},
      virtueBalance: {},
      averageSectionsPerWork: 0,
    },
  };

  const seenAuthors = new Set<string>();
  const seenSections = new Set<string>();

  // Validate works
  for (const work of corpus.works) {
    // Check for duplicate authors
    const authorKey = work.author.toLowerCase();
    if (seenAuthors.has(authorKey)) {
      result.issues.push({
        type: 'error',
        message: `Duplicate author: ${work.author}`,
        work: work.title,
      });
    }
    seenAuthors.add(authorKey);

    // Validate required fields
    if (!work.title || !work.author || !work.tradition) {
      result.issues.push({
        type: 'error',
        message: 'Missing required fields (title, author, tradition)',
        work: work.title,
      });
    }

    // Track traditions
    if (!result.traditions.includes(work.tradition)) {
      result.traditions.push(work.tradition);
    }
    result.qualityMetrics.traditionCoverage[work.tradition] =
      (result.qualityMetrics.traditionCoverage[work.tradition] || 0) + 1;

    // Validate sections
    if (!work.sections || !Array.isArray(work.sections)) {
      result.issues.push({
        type: 'error',
        message: 'Missing or invalid sections array',
        work: work.title,
      });
      continue;
    }

    result.totalSections += work.sections.length;

    for (const section of work.sections) {
      // Check for duplicate sections within work
      const sectionKey = `${work.author}-${section.title}`.toLowerCase();
      if (seenSections.has(sectionKey)) {
        result.issues.push({
          type: 'warning',
          message: `Duplicate section title within author: ${section.title}`,
          work: work.title,
          section: section.title,
        });
      }
      seenSections.add(sectionKey);

      // Validate required fields
      if (!section.title || !section.content || !section.virtue || !section.persona_tags) {
        result.issues.push({
          type: 'error',
          message: 'Missing required fields (title, content, virtue, persona_tags)',
          work: work.title,
          section: section.title,
        });
        continue;
      }

      // Content quality checks
      const contentLength = section.content.length;
      result.totalContentLength += contentLength;

      if (contentLength < 200) {
        result.issues.push({
          type: 'warning',
          message: `Content too short (${contentLength} chars)`,
          work: work.title,
          section: section.title,
        });
        result.qualityMetrics.contentLengthDistribution.short++;
      } else if (contentLength < 1000) {
        result.qualityMetrics.contentLengthDistribution.medium++;
      } else {
        result.qualityMetrics.contentLengthDistribution.long++;
      }

      // Track virtues
      if (!result.virtues.includes(section.virtue)) {
        result.virtues.push(section.virtue);
      }
      result.qualityMetrics.virtueBalance[section.virtue] =
        (result.qualityMetrics.virtueBalance[section.virtue] || 0) + 1;

      // Track persona tags
      for (const tag of section.persona_tags) {
        if (!result.personaTags.includes(tag)) {
          result.personaTags.push(tag);
        }
      }

      // Check persona tags relevance
      if (!section.persona_tags.some(tag => tag.toLowerCase().includes(work.author.toLowerCase().split(' ')[0]))) {
        result.issues.push({
          type: 'warning',
          message: 'Persona tags should include author reference',
          work: work.title,
          section: section.title,
        });
      }
    }
  }

  // Calculate averages
  result.averageSectionLength = result.totalSections > 0
    ? Math.round(result.totalContentLength / result.totalSections)
    : 0;

  result.qualityMetrics.averageSectionsPerWork = result.totalWorks > 0
    ? Math.round((result.totalSections / result.totalWorks) * 10) / 10
    : 0;

  return result;
}

async function validateDatabaseIngestion(): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    // Connect to database
    const pgClient = new Client({
      host: '127.0.0.1',
      port: 55433,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
    });

    await pgClient.connect();

    // Check table exists
    const tableResult = await pgClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'philosophy_chunks'
      );
    `);

    if (!tableResult.rows[0].exists) {
      issues.push({
        type: 'error',
        message: 'philosophy_chunks table does not exist',
      });
      return issues;
    }

    // Get statistics
    const statsResult = await pgClient.query(`
      SELECT
        COUNT(*) as total_chunks,
        COUNT(DISTINCT work) as unique_works,
        COUNT(DISTINCT author) as unique_authors,
        COUNT(DISTINCT tradition) as unique_traditions,
        AVG(LENGTH(content)) as avg_content_length,
        MIN(LENGTH(content)) as min_content_length,
        MAX(LENGTH(content)) as max_content_length
      FROM philosophy_chunks;
    `);

    const stats = statsResult.rows[0];
    console.log('📊 Database Statistics:');
    console.log(`   Total chunks: ${stats.total_chunks}`);
    console.log(`   Unique works: ${stats.unique_works}`);
    console.log(`   Unique authors: ${stats.unique_authors}`);
    console.log(`   Unique traditions: ${stats.unique_traditions}`);
    console.log(`   Avg content length: ${Math.round(stats.avg_content_length)} chars`);
    console.log(`   Content length range: ${stats.min_content_length} - ${stats.max_content_length} chars`);

    // Check for embedding vectors
    const embeddingResult = await pgClient.query(`
      SELECT COUNT(*) as chunks_with_embeddings
      FROM philosophy_chunks
      WHERE embedding IS NOT NULL;
    `);

    if (embeddingResult.rows[0].chunks_with_embeddings === 0) {
      issues.push({
        type: 'error',
        message: 'No chunks have embedding vectors',
      });
    } else if (embeddingResult.rows[0].chunks_with_embeddings !== stats.total_chunks) {
      issues.push({
        type: 'warning',
        message: `${stats.total_chunks - embeddingResult.rows[0].chunks_with_embeddings} chunks missing embeddings`,
      });
    }

    await pgClient.end();

  } catch (error) {
    issues.push({
      type: 'error',
      message: `Database connection/validation failed: ${error}`,
    });
  }

  return issues;
}

function printValidationReport(result: ValidationResult, dbIssues: ValidationIssue[]): void {
  console.log('🔍 Philosophy Corpus Validation Report');
  console.log('=' .repeat(50));

  console.log(`\n📚 Content Overview:`);
  console.log(`   Total works: ${result.totalWorks}`);
  console.log(`   Total sections: ${result.totalSections}`);
  console.log(`   Total content: ${result.totalContentLength.toLocaleString()} characters`);
  console.log(`   Average section length: ${result.averageSectionLength} characters`);

  console.log(`\n🏛️  Traditions: ${result.traditions.join(', ')}`);
  console.log(`🧠 Virtues: ${result.virtues.join(', ')}`);
  console.log(`🏷️  Persona tags: ${result.personaTags.slice(0, 10).join(', ')}${result.personaTags.length > 10 ? '...' : ''}`);

  console.log(`\n📊 Quality Metrics:`);
  console.log(`   Content length distribution:`);
  console.log(`     Short (<200 chars): ${result.qualityMetrics.contentLengthDistribution.short}`);
  console.log(`     Medium (200-1000 chars): ${result.qualityMetrics.contentLengthDistribution.medium}`);
  console.log(`     Long (>1000 chars): ${result.qualityMetrics.contentLengthDistribution.long}`);
  console.log(`   Average sections per work: ${result.qualityMetrics.averageSectionsPerWork}`);

  console.log(`\n🏛️  Tradition coverage:`);
  Object.entries(result.qualityMetrics.traditionCoverage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([tradition, count]) => {
      console.log(`     ${tradition}: ${count} works`);
    });

  console.log(`\n🧠 Virtue balance:`);
  Object.entries(result.qualityMetrics.virtueBalance)
    .sort(([,a], [,b]) => b - a)
    .forEach(([virtue, count]) => {
      console.log(`     ${virtue}: ${count} sections`);
    });

  // Issues
  const errors = [...result.issues.filter(i => i.type === 'error'), ...dbIssues.filter(i => i.type === 'error')];
  const warnings = [...result.issues.filter(i => i.type === 'warning'), ...dbIssues.filter(i => i.type === 'warning')];

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(issue => {
      console.log(`   ${issue.work ? `[${issue.work}] ` : ''}${issue.message}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(issue => {
      console.log(`   ${issue.work ? `[${issue.work}] ` : ''}${issue.message}`);
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ No issues found!');
  }
}

// Main execution
async function main() {
  try {
    console.log('🔍 Validating philosophy corpus...');

    const result = await validateCorpus();
    const dbIssues = await validateDatabaseIngestion();

    printValidationReport(result, dbIssues);

    const hasErrors = result.issues.some(i => i.type === 'error') || dbIssues.some(i => i.type === 'error');
    if (hasErrors) {
      console.log('\n❌ Validation failed - please fix errors before proceeding');
      process.exit(1);
    } else {
      console.log('\n✅ Validation passed!');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

main();