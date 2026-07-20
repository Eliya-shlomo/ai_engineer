// Make sure you've reviewd the README.md file to understand the task and the RAG flow

import { loadAllDocuments } from './dataLoader';
import { chunkText } from './chunking';
import { embedText, embedTexts, openaiClient } from './embeddings';
import { getExistingSourceIds, insertChunk, findSimilarChunks } from './vectorStore';

const CHAT_MODEL = 'gpt-4o-mini';
const WORDS_PER_CHUNK = 400;
const EMBEDDING_BATCH_SIZE = 50;
const MATCH_COUNT = 5;

export const loadAllData = async (): Promise<void> => {
  const documents = await loadAllDocuments();

  const existingIdsBySource = new Map<string, Set<string>>();
  for (const { source } of documents) {
    if (!existingIdsBySource.has(source)) {
      existingIdsBySource.set(source, await getExistingSourceIds(source));
    }
  }

  for (const document of documents) {
    const existingIds = existingIdsBySource.get(document.source)!;
    if (existingIds.has(document.sourceId)) {
      console.log(`Skipping already-loaded ${document.source}/${document.sourceId}`);
      continue;
    }

    const chunks = chunkText(document.text, WORDS_PER_CHUNK);
    console.log(
      `Embedding ${chunks.length} chunks for ${document.source}/${document.sourceId}`
    );

    for (let batchStart = 0; batchStart < chunks.length; batchStart += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(batchStart, batchStart + EMBEDDING_BATCH_SIZE);
      const embeddings = await embedTexts(batch);

      for (let i = 0; i < batch.length; i++) {
        await insertChunk({
          source: document.source,
          sourceId: document.sourceId,
          chunkIndex: batchStart + i,
          chunkContent: batch[i],
          embedding: embeddings[i],
        });
      }
    }
  }
};

export const ask = async (userQuestion: string): Promise<string> => {
  const questionEmbedding = await embedText(userQuestion);
  const matches = await findSimilarChunks(questionEmbedding, MATCH_COUNT);

  const context = matches
    .map((match, i) => `[${i + 1}] (${match.source}/${match.source_id})\n${match.chunk_content}`)
    .join('\n\n');

  const completion = await openaiClient.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          "You are a helpful assistant answering questions about Lev-Boots technology. Answer the user's question using ONLY the provided context. If the context does not contain enough information to answer, say you don't know based on the available information. Do not use outside knowledge.",
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${userQuestion}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content ?? '';
};
