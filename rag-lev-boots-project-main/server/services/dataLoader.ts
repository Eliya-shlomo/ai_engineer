import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RawDocument {
  source: string;
  sourceId: string;
  text: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  retries = 6,
  backoffMs = 1000
): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url);
    if (response.ok) return response;

    if (response.status === 429 && attempt < retries) {
      await sleep(backoffMs * (attempt + 1));
      continue;
    }

    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  throw new Error(`Request to ${url} failed after ${retries} retries`);
};

const PDF_FILES = [
  'OpEd - A Revolution at Our Feet.pdf',
  'Research Paper - Gravitational Reversal Physics.pdf',
  'White Paper - The Development of Localized Gravity Reversal Technology.pdf',
];

export const loadPdfDocuments = async (): Promise<RawDocument[]> => {
  const documents: RawDocument[] = [];

  for (const fileName of PDF_FILES) {
    const filePath = path.join(__dirname, '../knowledge_pdfs', fileName);
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    documents.push({
      source: 'pdf',
      sourceId: fileName.replace(/\.pdf$/i, ''),
      text: result.text,
    });
  }

  return documents;
};

const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety',
];

const ARTICLE_BASE_URL =
  'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

export const loadArticleDocuments = async (): Promise<RawDocument[]> => {
  const documents: RawDocument[] = [];

  for (let i = 0; i < ARTICLE_IDS.length; i++) {
    const articleId = ARTICLE_IDS[i];
    const url = `${ARTICLE_BASE_URL}/article-${i + 1}_${articleId}.md`;
    const response = await fetchWithRetry(url);
    const text = await response.text();

    documents.push({ source: 'article', sourceId: articleId, text });
  }

  return documents;
};

const SLACK_CHANNELS = ['lab-notes', 'engineering', 'offtopic'];
const SLACK_BASE_URL = 'https://lev-boots-slack-api.jona-581.workers.dev/';

interface SlackMessage {
  id: string;
  user: string;
  role: string;
  ts: string;
  text: string;
  thread_ts: string;
}

interface SlackResponse {
  channel: string;
  page: number;
  limit: number;
  total: number;
  items: SlackMessage[];
}

export const loadSlackDocuments = async (): Promise<RawDocument[]> => {
  const documents: RawDocument[] = [];

  for (const channel of SLACK_CHANNELS) {
    const messages: SlackMessage[] = [];
    let page = 1;

    while (true) {
      const url = `${SLACK_BASE_URL}?channel=${channel}&page=${page}`;
      const response = await fetchWithRetry(url);
      const data = (await response.json()) as SlackResponse;

      messages.push(...data.items);

      if (data.items.length === 0 || messages.length >= data.total) {
        break;
      }

      page += 1;
      await sleep(500);
    }

    const text = messages
      .map((message) => `[${message.ts}] ${message.user} (${message.role}): ${message.text}`)
      .join('\n');

    documents.push({ source: 'slack', sourceId: channel, text });
  }

  return documents;
};

export const loadAllDocuments = async (): Promise<RawDocument[]> => {
  const [pdfs, articles, slack] = await Promise.all([
    loadPdfDocuments(),
    loadArticleDocuments(),
    loadSlackDocuments(),
  ]);

  return [...pdfs, ...articles, ...slack];
};
