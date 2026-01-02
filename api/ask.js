import PROFILE_CONTEXT from '../shared/aiProfile.js';

const GEMINI_API_HOST_V1 = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_API_HOST_V1BETA = 'https://generativelanguage.googleapis.com/v1beta';

function getLocalISODate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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

async function callGemini({ apiHost, geminiKey, model, systemInstruction, userText, temperature }) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Missing question' });
    }

    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY_VERCEL ||
      process.env.GEMINI_KEY;

    if (!geminiKey) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY.',
      });
    }

    const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const systemInstruction =
      "You are an assistant for Rishika Gupta's portfolio website. If the user asks about Rishika/the owner/the portfolio (including skills, projects, education, contact), answer from the provided Owner Profile. Do not ask who Rishika is. If the profile lacks a detail, say you don't know." +
      '\n\n' +
      PROFILE_CONTEXT() +
      `\n\nRuntime context: Today's date is ${getLocalISODate()} (server local time).`;

    const questionText = question.trim();

    let modelUsed = configuredModel;
    let apiHostUsed = GEMINI_API_HOST_V1;
    let geminiRes = await callGemini({
      apiHost: apiHostUsed,
      geminiKey,
      model: modelUsed,
      systemInstruction,
      userText: questionText,
      temperature: 0.4,
    });

    // Retry if the configured model isn't available: ListModels (v1 then v1beta) -> pick supported -> retry.
    if (!geminiRes.ok && geminiRes.status === 404) {
      const ct = geminiRes.headers.get('content-type') || '';
      const body = ct.includes('application/json')
        ? await geminiRes.json()
        : { error: { message: await geminiRes.text() } };

      try {
        const attempts = [
          { host: GEMINI_API_HOST_V1, label: 'v1' },
          { host: GEMINI_API_HOST_V1BETA, label: 'v1beta' },
        ];

        let retried = false;
        for (const attempt of attempts) {
          const models = await listGeminiModels(geminiKey, attempt.host);
          const picked = pickSupportedModel(models);
          if (!picked) continue;

          modelUsed = picked;
          apiHostUsed = attempt.host;
          geminiRes = await callGemini({
            apiHost: apiHostUsed,
            geminiKey,
            model: modelUsed,
            systemInstruction,
            userText: questionText,
            temperature: 0.4,
          });
          retried = true;
          break;
        }

        if (!retried) {
          const requestId = geminiRes.headers.get('x-request-id') || undefined;
          return res.status(502).json({
            success: false,
            error: 'Upstream AI request failed',
            upstreamStatus: 404,
            upstreamCode: body?.error?.status,
            upstreamMessage: body?.error?.message,
            requestId,
            modelUsed,
            apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
            answer:
              body?.error?.message ||
              "Sorry, I'm having trouble connecting to the AI service.",
            details: body,
          });
        }
      } catch (e) {
        const requestId = geminiRes.headers.get('x-request-id') || undefined;
        return res.status(502).json({
          success: false,
          error: 'Upstream AI request failed',
          upstreamStatus: 404,
          upstreamCode: body?.error?.status,
          upstreamMessage: body?.error?.message,
          requestId,
          modelUsed,
          apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
          answer:
            body?.error?.message ||
            "Sorry, I'm having trouble connecting to the AI service.",
          details: body,
        });
      }
    }

    const contentType = geminiRes.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await geminiRes.json()
      : { error: await geminiRes.text() };

    if (!geminiRes.ok) {
      const requestId = geminiRes.headers.get('x-request-id') || undefined;
      return res.status(502).json({
        success: false,
        error: 'Upstream AI request failed',
        upstreamStatus: geminiRes.status,
        upstreamCode: data?.error?.status,
        upstreamMessage: data?.error?.message,
        requestId,
        modelUsed,
        apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
        answer:
          data?.error?.message ||
          "Sorry, I'm having trouble connecting to the AI service.",
        details: data,
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join('')
        .trim() || "I couldn't generate a response. Please try again.";

    return res.status(200).json({
      success: true,
      model: modelUsed,
      apiVersionUsed: apiHostUsed === GEMINI_API_HOST_V1BETA ? 'v1beta' : 'v1',
      answer,
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI request failed',
      answer: 'Sorry, something went wrong on my end. Please try again later.',
    });
  }
}
