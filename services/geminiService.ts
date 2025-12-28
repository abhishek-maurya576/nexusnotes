import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Source, Flashcard, QuizQuestion } from "../types";

// NOTE: In a real app, do not expose API_KEY in client-side code.
// This is for demonstration purposes.

/**
 * Simulates a RAG approach by stuffing the context window.
 * Gemini 2.5/3.0 has a massive context window (1M+ tokens), 
 * which often negates the need for vector DBs for personal notebooks.
 */
export const queryNotebook = async (
  history: ChatMessage[],
  sources: Source[],
  message: string,
  useReasoning: boolean = false
): Promise<string> => {
  // Always create a new instance to pick up the latest API key from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. Prepare Context from Sources
  // In a real RAG app, this would be replaced by the Vector DB retrieval step.
  const contextBlock = sources.map(s => 
    `--- START SOURCE: ${s.name} ---\n${s.content}\n--- END SOURCE ---`
  ).join("\n\n");

  const systemInstruction = `
    You are NexusNotes, an intelligent research assistant. 
    You have access to the following documents (Sources).
    Answer the user's question based primarily on these sources.
    If the answer is not in the sources, say so, but you may offer general knowledge if explicitly asked.
    Keep answers concise and professional.
    Structure your response with Markdown.
  `;

  // 2. Select Model
  // Use Gemini 3 Pro for deep reasoning, Flash for speed
  const modelName = useReasoning ? 'gemini-3-pro-preview' : 'gemini-flash-latest';

  try {
    const chatSession = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more factual answers
        thinkingConfig: useReasoning ? { thinkingBudget: 4096 } : undefined // Enable thinking for Pro model
      }
    });

    // 3. Send Message with Context
    // We prepend the context to the first message or the current message depending on strategy.
    // Here we include it in the prompt for simplicity.
    const prompt = `
    CONTEXT DOCUMENTS:
    ${contextBlock}

    USER QUERY:
    ${message}
    `;

    const result = await chatSession.sendMessage({
      message: prompt
    });

    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with Gemini. Please check your API key.";
  }
};

export const generateNote = async (content: string, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Source text: ${content}\n\nTask: ${instruction}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Note Generation Error", error);
    return "Failed to generate note.";
  }
};

export const suggestTitle = async (content: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Generate a very short, 3-5 word title for this content:\n${content.substring(0, 5000)}`,
    });
    return response.text?.replace(/['"]+/g, '').trim() || "New Notebook";
  } catch (e) {
    return "Untitled Notebook";
  }
};

export const generateInfographic = async (sourceContent: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Enhanced prompt for better quality and framing
    const prompt = `
      Generate a high-quality, highly detailed infographic image.
      
      **CRITICAL FRAMING & LAYOUT:**
      - The generated image MUST include a wide, visible margin on all four sides (top, bottom, left, right).
      - ABSOLUTELY NO content (text, icons, title) should touch the edges of the image.
      - Center the entire infographic composition within the frame.
      - Ensure the aspect ratio is respected and no part of the infographic is cut off.

      **VISUAL STYLE:**
      - Professional, modern vector art style.
      - High resolution, 4k quality, sharp lines.
      - Clean typography and cohesive color palette (blues, greens, greys).

      **CONTENT INSTRUCTIONS:**
      Synthesize the provided source text into a visual summary:
      1. **Title:** Clear, bold title at the top summarizing the main topic.
      2. **Structure:** Break down key themes into distinct sections using stylized icons.
      3. **Data:** Visualize numerical data with charts (bar, pie) if present.
      4. **Flow:** Use connecting lines or arrows to show relationships.

      **SOURCE TEXT:**
      ${sourceContent.substring(0, 8000)} 
    `;

    // Use Gemini 2.5 Flash Image
    // Note: imageSize is NOT supported in this model, so we only use aspectRatio.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    // Iterate to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Infographic Generation Error:", error);
    throw error;
  }
};

export const generateFlashcards = async (content: string): Promise<{title: string, cards: Flashcard[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following text and create a set of study flashcards.
        Focus on key terms, important dates, core concepts, and definitions.
        Create between 5 to 15 cards depending on the length of the text.
        Also generate a short, descriptive title for this set.
        
        Source Text:
        ${content.substring(0, 20000)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "The question, term, or concept" },
                  back: { type: Type.STRING, description: "The answer, definition, or explanation" }
                }
              }
            }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Flashcard Gen Error", error);
    throw error;
  }
};

export const generateQuiz = async (content: string, numQuestions: number): Promise<{title: string, questions: QuizQuestion[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Create a multiple-choice quiz based on the following text.
        Generate exactly ${numQuestions} questions.
        For each question, provide 4 options, the index of the correct answer (0-3), and a short explanation.
        Also generate a catchy title for the quiz.

        Source Text:
        ${content.substring(0, 20000)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Ensure IDs are present (Gemini might not generate them)
      data.questions = data.questions.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substring(7)
      }));
      return data;
    }
    throw new Error("Empty quiz response");
  } catch (error) {
    console.error("Quiz Gen Error", error);
    throw error;
  }
};