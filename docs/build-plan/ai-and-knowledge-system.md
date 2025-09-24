# AI & Knowledge System

## 1. Provider Abstraction Layer
- Implement a unified AI service interface supporting `complete`, `stream`, `embed`, and `getHealthStatus` methods.
- Build provider clients for OpenAI, Anthropic, Together, and Ollama.
- Introduce health caching and failover logic driven by configuration priorities.

## 2. Retrieval-Augmented Generation (RAG)
- Implement hybrid retrieval utilities combining vector and keyword search.
- Integrate pgvector, semantic reranking, and caching mechanisms.
- Support persona and tradition filtering alongside citation validation pipelines.

## 3. Persona & Prompt System
- Define persona metadata including voice, virtues, prompts, and constraints.
- Assemble system prompt templates and user context enrichment flows.
- Enforce output formatting with citations and suggested micro-actions.

## 4. Conversation Workflow & Persistence
- Implement `/api/marcus` streaming flow with cache checks and context enrichment.
- Manage Supabase persistence for chat transcripts and relevant telemetry events.
- Handle SSE/ReadableStream responses to provide real-time updates.

## 5. Corpus Management Tools
- Build ingestion scripts for philosophy texts and metadata updates.
- Add monitoring endpoints and administrative actions for corpus status tracking.
- Automate embedding generation and maintain progress visibility.
