#!/usr/bin/env npx tsx

/**
 * Corpus Merger Script
 *
 * Merges individual philosopher content files into the main philosophy-corpus.json
 * Usage: npx tsx scripts/merge-corpus.ts <philosopher-content.json>
 */

import * as fs from 'fs';
import * as path from 'path';

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

function mergeCorpus(mainCorpusPath: string, newContentPath: string): void {
  // Read main corpus
  const mainCorpus: CorpusData = JSON.parse(
    fs.readFileSync(mainCorpusPath, 'utf-8')
  );

  // Read new content
  const newContent: CorpusData = JSON.parse(
    fs.readFileSync(newContentPath, 'utf-8')
  );

  // Validate new content structure
  validateCorpusStructure(newContent);

  // Check for duplicates
  const existingAuthors = new Set(
    mainCorpus.works.map(work => work.author.toLowerCase())
  );

  const newAuthors = newContent.works.map(work => work.author.toLowerCase());
  const duplicates = newAuthors.filter(author => existingAuthors.has(author));

  if (duplicates.length > 0) {
    console.warn(`Warning: Found duplicate authors: ${duplicates.join(', ')}`);
    console.warn('These will be replaced with new content.');
  }

  // Remove existing works by the same authors
  mainCorpus.works = mainCorpus.works.filter(
    work => !newAuthors.includes(work.author.toLowerCase())
  );

  // Add new works
  mainCorpus.works.push(...newContent.works);

  // Sort works by author name
  mainCorpus.works.sort((a, b) => a.author.localeCompare(b.author));

  // Write back to main corpus
  fs.writeFileSync(
    mainCorpusPath,
    JSON.stringify(mainCorpus, null, 2) + '\n'
  );

  console.log(`✅ Successfully merged ${newContent.works.length} works`);
  console.log(`📊 Total works in corpus: ${mainCorpus.works.length}`);
  console.log(`📝 Authors: ${mainCorpus.works.map(w => w.author).join(', ')}`);
}

function validateCorpusStructure(corpus: CorpusData): void {
  if (!corpus.works || !Array.isArray(corpus.works)) {
    throw new Error('Corpus must have a "works" array');
  }

  for (const work of corpus.works) {
    if (!work.title || !work.author || !work.tradition) {
      throw new Error(`Work missing required fields: ${JSON.stringify(work, null, 2)}`);
    }

    if (!work.sections || !Array.isArray(work.sections)) {
      throw new Error(`Work "${work.title}" must have a "sections" array`);
    }

    for (const section of work.sections) {
      if (!section.title || !section.content || !section.virtue || !section.persona_tags) {
        throw new Error(`Section missing required fields: ${JSON.stringify(section, null, 2)}`);
      }

      if (section.content.length < 100) {
        console.warn(`Warning: Section "${section.title}" content is very short (${section.content.length} chars)`);
      }

      if (section.content.length > 2000) {
        console.warn(`Warning: Section "${section.title}" content is very long (${section.content.length} chars)`);
      }
    }
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('Usage: npx tsx scripts/merge-corpus.ts <philosopher-content.json>');
  process.exit(1);
}

const newContentPath = path.resolve(args[0]);
const mainCorpusPath = path.join(process.cwd(), 'data', 'corpus', 'philosophy-corpus.json');

if (!fs.existsSync(newContentPath)) {
  console.error(`Error: New content file not found: ${newContentPath}`);
  process.exit(1);
}

if (!fs.existsSync(mainCorpusPath)) {
  console.error(`Error: Main corpus file not found: ${mainCorpusPath}`);
  process.exit(1);
}

try {
  mergeCorpus(mainCorpusPath, newContentPath);
  console.log('🎉 Corpus merge completed successfully!');
} catch (error) {
  console.error('❌ Corpus merge failed:', error);
  process.exit(1);
}