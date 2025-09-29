#!/usr/bin/env npx tsx

/**
 * Philosophy Corpus Ingestion Script
 *
 * This script processes philosophy texts from the corpus data,
 * chunks them appropriately, generates embeddings, and stores
 * the        await pgClient.query(`
          INSERT INTO philosophy_chunks (
            work, author, tradition, section, virtue, persona_tags, content, embedding, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          chunk.work,
          chunk.author,
          chunk.tradition,
          chunk.section,
          chunk.virtue,
          chunk.persona_tags,
          chunk.content,
          `[${embedding.join(',')}]`,
          chunk.metadata
        ]);y_chunks table for RAG retrieval.
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { Client } from 'pg';
import OpenAI from 'openai';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Create PostgreSQL client directly
const pgClient = new Client({
  host: '127.0.0.1',
  port: 55433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({ apiKey: openaiApiKey });

interface CorpusWork {
  title: string;
  author: string;
  tradition: string;
  sections: CorpusSection[];
}

interface CorpusSection {
  title: string;
  content: string;
  virtue: string;
  persona_tags: string[];
}

interface PhilosophyChunk {
  work: string;
  author: string;
  tradition: string;
  section: string;
  virtue: string;
  persona_tags: string[];
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

/**
 * Split text into chunks of approximately 500-1000 characters
 * while preserving sentence boundaries
 */
function chunkText(text: string, maxChunkSize = 800): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // If adding this sentence would exceed the limit, save current chunk
    if (currentChunk.length + trimmedSentence.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generate embeddings for text chunks
 */
async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });

      embeddings.push(...response.data.map((item) => item.embedding));
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }

    // Small delay between batches
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return embeddings;
}

/**
 * Main ingestion function
 */
async function ingestCorpus() {
  console.log('Starting philosophy corpus ingestion...');

  // Connect to database
  await pgClient.connect();
  console.log('Database connection successful');

  // Ensure philosophy_chunks table exists
  await pgClient.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS philosophy_chunks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work TEXT NOT NULL,
      author TEXT,
      tradition TEXT,
      section TEXT,
      virtue TEXT,
      persona_tags TEXT[],
      content TEXT NOT NULL,
      embedding VECTOR(1536),
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
  console.log('Ensured philosophy_chunks table exists');

  // Load corpus data
  const corpusPath = path.join(process.cwd(), 'data', 'corpus', 'philosophy-corpus.json');
  if (!fs.existsSync(corpusPath)) {
    throw new Error(`Corpus file not found: ${corpusPath}`);
  }

  const corpusData = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
  console.log('Starting corpus ingestion...');

  let totalChunks = 0;

  for (const work of corpusData.works as CorpusWork[]) {
    console.log(`Processing work: ${work.title} by ${work.author}`);

    for (const section of work.sections) {
      console.log(`Processing section: ${section.title}`);

      // Chunk the content
      const textChunks = chunkText(section.content);

      if (textChunks.length === 0) {
        console.warn(`No chunks generated for section: ${section.title}`);
        continue;
      }

      // Generate embeddings
      const embeddings = await generateEmbeddings(textChunks);

      // Prepare chunks for insertion
      const chunks: Omit<PhilosophyChunk, 'embedding'>[] = textChunks.map((chunk, index) => ({
        work: work.title,
        author: work.author,
        tradition: work.tradition,
        section: section.title,
        virtue: section.virtue,
        persona_tags: section.persona_tags,
        content: chunk,
        metadata: {
          chunk_index: index,
          total_chunks: textChunks.length,
          original_length: section.content.length,
          chunk_length: chunk.length
        }
      }));

      // Insert chunks with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        await pgClient.query(`
          INSERT INTO philosophy_chunks (
            work, author, tradition, section, virtue, persona_tags, content, embedding, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          chunk.work,
          chunk.author,
          chunk.tradition,
          chunk.section,
          chunk.virtue,
          chunk.persona_tags,
          chunk.content,
          `[${embedding.join(',')}]`,
          chunk.metadata
        ]);

        totalChunks++;
        console.log(`Inserted chunk ${i + 1}/${chunks.length} for ${section.title}`);
      }
    }
  }

  console.log(`Ingestion complete! Inserted ${totalChunks} chunks total.`);

  // Close database connection
  await pgClient.end();
}

// Run the ingestion
ingestCorpus().catch(error => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});