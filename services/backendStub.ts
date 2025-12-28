/**
 * RAG PIPELINE & BACKEND ARCHITECTURE EXPLANATION
 * 
 * In a production environment, NexusNotes would use the following architecture:
 * 
 * 1. Document Ingestion:
 *    - User uploads PDF/Text.
 *    - Server parses text (e.g., using `pdf-parse`).
 *    - Text is split into chunks (e.g., 1000 tokens with 100 token overlap).
 * 
 * 2. Embedding:
 *    - Chunks are passed to `ai.models.embedContent` (Gemini Embedding model).
 *    - Returns a vector (list of floating point numbers).
 * 
 * 3. Storage:
 *    - Vectors + Metadata (text content, source ID) stored in Pinecone/Supabase Vector.
 * 
 * 4. Retrieval (The API Route):
 *    - User asks question.
 *    - Question is embedded.
 *    - Vector DB searches for nearest neighbor vectors (Cosine Similarity).
 *    - Top K chunks are retrieved.
 * 
 * 5. Generation:
 *    - Retrieved chunks are pasted into the System Prompt as "Context".
 *    - Gemini answers based ONLY on that context.
 * 
 * BELOW IS THE SAMPLE BACKEND CODE (Node.js/Express)
 */

export const backendRouteSnippet = `
// backend/routes/query.js
import express from 'express';
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_KEY });

router.post('/api/chat', async (req, res) => {
  try {
    const { message, notebookId } = req.body;

    // 1. Embed the user's query
    const embeddingResponse = await ai.models.embedContent({
      model: "text-embedding-004",
      content: message,
    });
    const queryVector = embeddingResponse.embedding.values;

    // 2. Query Vector DB for relevant chunks
    const index = pinecone.Index("nexus-notes");
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 5,
      filter: { notebookId: notebookId },
      includeMetadata: true
    });

    // 3. Construct Context
    const contextText = queryResponse.matches
      .map(match => \`Source (\${match.metadata.sourceName}): \${match.metadata.text}\`)
      .join("\\n\\n");

    // 4. Generate Answer with Gemini
    const systemInstruction = "You are a helpful research assistant. Answer the user question using ONLY the provided context. Cite your sources.";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: \`Context:\\n\${contextText}\\n\\nQuestion: \${message}\` }] }
      ],
      config: { systemInstruction }
    });

    res.json({ answer: response.text, citations: queryResponse.matches });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process request" });
  }
});
`;
