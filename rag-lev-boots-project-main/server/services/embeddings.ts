import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

export const openaiClient = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const response = await openaiClient.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data.map((item) => item.embedding);
};

export const embedText = async (text: string): Promise<number[]> => {
  const [embedding] = await embedTexts([text]);
  return embedding;
};
