import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

const toVectorLiteral = (embedding: number[]): string => `[${embedding.join(',')}]`;

export const getExistingSourceIds = async (source: string): Promise<Set<string>> => {
  const rows = await sequelize.query<{ source_id: string }>(
    'SELECT DISTINCT source_id FROM knowledge_base WHERE source = :source',
    { replacements: { source }, type: QueryTypes.SELECT }
  );

  return new Set(rows.map((row) => row.source_id));
};

export const insertChunk = async (params: {
  source: string;
  sourceId: string;
  chunkIndex: number;
  chunkContent: string;
  embedding: number[];
}): Promise<void> => {
  await sequelize.query(
    `INSERT INTO knowledge_base (source, source_id, chunk_index, chunk_content, embeddings_1536)
     VALUES (:source, :sourceId, :chunkIndex, :chunkContent, :vectorLiteral::vector(1536))`,
    {
      replacements: {
        source: params.source,
        sourceId: params.sourceId,
        chunkIndex: params.chunkIndex,
        chunkContent: params.chunkContent,
        vectorLiteral: toVectorLiteral(params.embedding),
      },
    }
  );
};

export interface SimilarChunk {
  source: string;
  source_id: string;
  chunk_content: string;
  distance: number;
}

export const findSimilarChunks = async (
  embedding: number[],
  limit = 5
): Promise<SimilarChunk[]> => {
  return sequelize.query<SimilarChunk>(
    `SELECT source, source_id, chunk_content, embeddings_1536 <=> :vectorLiteral::vector(1536) AS distance
     FROM knowledge_base
     WHERE embeddings_1536 IS NOT NULL
     ORDER BY distance ASC
     LIMIT :limit`,
    {
      replacements: { vectorLiteral: toVectorLiteral(embedding), limit },
      type: QueryTypes.SELECT,
    }
  );
};
