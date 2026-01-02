import express from 'express';
import fetch from 'node-fetch';
import PROFILE_CONTEXT from '../../../shared/aiProfile.js';

const router = express.Router();

const GEMINI_API_HOST_V1 = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_API_HOST_V1BETA = 'https://generativelanguage.googleapis.com/v1beta';

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedModelList = null;
let cachedModelListAt = 0;

function normalizeModelName(name) {
  if (!name) return name;
  return String(name).replace(/^models\//, '');
}

async function listGeminiModels(geminiKey, apiHost) {
  const now = Date.now();
  if (cachedModelList && now - cachedModelListAt < MODEL_CACHE_TTL_MS) {
    return cachedModelList;
  }

  const url = `${apiHost}/models?key=${encodeURIComponent(geminiKey)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await res.json()
    : { error: { message: await res.text() } };

  if (!res.ok) {
    const err = new Error(body?.error?.message || 'ListModels failed');
    err.status = res.status;
    err.details = body;
    throw err;
  }

  const models = Array.isArray(body?.models) ? body.models : [];
  cachedModelList = models;
  cachedModelListAt = now;
  return models;
}

function pickSupportedModel(models) {
  const supported = models
    .filter((m) => Array.isArray(m?.supportedGenerationMethods))
    .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
    .map((m) => normalizeModelName(m.name))
    .filter(Boolean);

  const prefer = (needle) => supported.find((n) => n.includes(needle));

  return (
    prefer('1.5-flash') ||
    prefer('flash') ||
    prefer('1.5-pro') ||
    prefer('pro') ||
    supported[0]
  );
}

function getLocalISODate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function callGemini({ apiHost, geminiKey, model, systemInstruction, userText }) {
  const url = `${apiHost}/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(geminiKey)}`;

  const prompt = `${systemInstruction}\n\nUser: ${userText}`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
}

// Chat endpoint
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: "Missing or invalid 'question'",
        answer: 'Please provide a valid question.',
      });
    }

    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_KEY;

    // Check API key
    if (!geminiKey) {
      return res.status(500).json({
        error: 'API key not configured',
        answer: 'AI service is not properly configured.',
      });
    }

    // Choose model (may be overridden by ListModels fallback)
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const systemInstruction =
      "You are an assistant for Rishika Gupta's portfolio website. If the user asks about Rishika/the owner/the portfolio (including skills, projects, education, contact), answer from the provided Owner Profile. Do not ask the user for who Rishika is. If the profile lacks a detail, say you don't know." +
      '\n\n' +
      PROFILE_CONTEXT() +
      `\n\nRuntime context: Today's date is ${getLocalISODate()} (server local time).`;

    const questionText = question.trim();

    let modelUsed = configuredModel;
    let apiHostUsed = GEMINI_API_HOST_V1;
    let response = await callGemini({
      apiHost: apiHostUsed,
      geminiKey,
      model: modelUsed,
      systemInstruction,
      userText: questionText,
    });

    let prefetchedErrorBody;

    // If the configured model isn't available, discover a supported model and retry.
    // We try v1 first, then v1beta, because keys/projects sometimes expose models on one and not the other.
    if (!response.ok && response.status === 404) {
      const contentType = response.headers.get('content-type') || '';
      const raw = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      const upstreamMessage =
        raw && typeof raw === 'object' ? raw?.error?.message : undefined;

      prefetchedErrorBody = { contentType, raw };

      if (typeof upstreamMessage === 'string') {
        const attempts = [
          { host: GEMINI_API_HOST_V1, label: 'v1' },
          { host: GEMINI_API_HOST_V1BETA, label: 'v1beta' },
        ];

        let listModelsError;
        for (const attempt of attempts) {
          try {
            const models = await listGeminiModels(geminiKey, attempt.host);
            const picked = pickSupportedModel(models);
            if (!picked) {
              listModelsError = `ListModels returned no generateContent models on ${attempt.label}`;
              continue;
            }

            modelUsed = picked;
            apiHostUsed = attempt.host;
            response = await callGemini({
              apiHost: apiHostUsed,
              geminiKey,
              model: modelUsed,
              systemInstruction,
              userText: questionText,
            });

            // If we retried, the prefetched body is irrelevant.
            prefetchedErrorBody = undefined;
            listModelsError = undefined;
            break;
          } catch (e) {
            listModelsError = `ListModels failed on ${attempt.label}: ${e?.message || String(e)}`;
          }
        }

        // If we couldn't retry successfully, attach ListModels failure info for easier debugging.
        if (listModelsError && prefetchedErrorBody && typeof prefetchedErrorBody.raw === 'object') {
          prefetchedErrorBody.raw = {
            ...prefetchedErrorBody.raw,
            _listModelsError: listModelsError,
          };
        }
      }
    }

    if (!response.ok) {
      const contentType =
        prefetchedErrorBody?.contentType ||
        response.headers.get('content-type') ||
        '';
      const raw = prefetchedErrorBody
        ? prefetchedErrorBody.raw
        : contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      const upstreamMessage =
        raw && typeof raw === 'object' ? raw?.error?.message : undefined;
      const upstreamCode =
        raw && typeof raw === 'object' ? raw?.error?.status : undefined;

      console.error(
        'Gemini API error:',
        response.status,
        typeof raw === 'string' ? raw : JSON.stringify(raw)
      );

      let errorMessage =
        "Sorry, I'm having trouble connecting to the AI service.";
      if (response.status === 401) {
        errorMessage =
          'AI service authentication failed. Please check API key.';
      } else if (response.status === 429) {
        errorMessage = 'AI service is busy. Please try again in a moment.';
      } else if (response.status === 500) {
        errorMessage = 'AI service is temporarily unavailable.';
      }

      // Keep old behavior: return 200 so frontend can display message.
      return res.status(200).json({
        success: false,
        error: 'Upstream AI error',
        upstreamStatus: response.status,
        upstreamCode,
        upstreamMessage,
        answer: upstreamMessage || errorMessage,
        modelUsed,
        apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join('')
        .trim() || "I couldn't generate a response. Please try again.";

    return res.json({
      answer,
      timestamp: new Date().toISOString(),
      model: modelUsed,
      success: true,
      apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(200).json({
      success: false,
      error: 'Server error',
      answer: 'Sorry, something went wrong on my end. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
