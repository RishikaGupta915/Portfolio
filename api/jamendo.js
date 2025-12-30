export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error:
        'Missing CLIENT_ID.',
    });
  }

  const limitRaw = req.query?.limit;
  const limit = Math.min(200, Math.max(1, Number(limitRaw || 50)));

  const qRaw = req.query?.q;
  const q = typeof qRaw === 'string' ? qRaw.trim() : '';

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(limit),
      audioformat: 'mp32',
      include: 'musicinfo+stats',
    });

    if (q) {
      params.set('namesearch', q);
    } else {
      // Stable default ordering when not searching.
      params.set('order', 'popularity_total');
    }

    const url = `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`;

    const upstream = await fetch(url);
    const contentType = upstream.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await upstream.json()
      : { error: await upstream.text() };

    if (!upstream.ok) {
      return res.status(502).json({
        error: 'Jamendo upstream request failed',
        upstreamStatus: upstream.status,
        details: data,
      });
    }

    return res.status(200).json({
      results: Array.isArray(data?.results) ? data.results : [],
    });
  } catch (err) {
    console.error('Jamendo proxy error:', err);
    return res.status(500).json({ error: 'Jamendo request failed' });
  }
}
