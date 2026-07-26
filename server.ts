import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Editorial Feedback on Submitted Article
app.post("/api/ai/editorial-review", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is not configured in server environment.",
      });
    }

    const { title, content, category, locality } = req.body;

    const prompt = `You are an experienced local newspaper and community blog editor.
Review the following article submission for a local community publication.

Article Title: ${title || "Untitled"}
Locality/Neighborhood: ${locality || "General Community"}
Category: ${category || "General"}
Content:
${content}

Provide structured feedback in JSON format:
{
  "rating": number (1 to 5 stars),
  "localRelevanceScore": number (1 to 100),
  "strengths": [string, string],
  "areasToImprove": [string, string],
  "editorialRecommendation": "Approve as is" | "Minor revisions needed" | "Major revisions needed" | "Not suitable",
  "suggestedHeadline": string,
  "suggestedExcerpt": string,
  "complianceCheck": {
    "respectfulTone": boolean,
    "noHarmfulContent": boolean,
    "localFocus": boolean
  },
  "detailedFeedback": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (err: any) {
    console.error("Error in editorial-review:", err);
    return res.status(500).json({ error: err.message || "Failed to generate review." });
  }
});

// API: Headline & Excerpt Generator
app.post("/api/ai/headline-ideas", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key missing." });
    }

    const { content, category, locality } = req.body;

    const prompt = `You are a headline editor for a local community blog. Given the article draft below, generate:
1. 5 engaging headline ideas tailored for local community readers (engaging, honest, non-clickbait).
2. A compelling 2-sentence excerpt (summary).
3. 5 relevant tags (e.g., #LocalEvents, #OakridgeHistory, #SmallBusiness).

Draft Content:
${content}
Category: ${category}
Neighborhood: ${locality}

Respond in JSON:
{
  "headlines": [string, string, string, string, string],
  "excerpt": string,
  "tags": [string, string, string, string, string]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (err: any) {
    console.error("Error in headline-ideas:", err);
    return res.status(500).json({ error: err.message || "Failed to generate headlines." });
  }
});

// API: Proofread & Polish Draft
app.post("/api/ai/proofread", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key missing." });
    }

    const { content } = req.body;

    const prompt = `You are a friendly writing coach. Proofread and polish the following text for a local community blog while preserving the author's personal voice, tone, and local nuances.

Original Text:
${content}

Respond in JSON:
{
  "polishedText": string,
  "changesSummary": [string, string],
  "readabilityScore": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (err: any) {
    console.error("Error in proofread:", err);
    return res.status(500).json({ error: err.message || "Failed to proofread content." });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Local Writers Blog Platform" });
});

// Start Express + Vite Middleware / Static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
