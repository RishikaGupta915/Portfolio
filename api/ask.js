export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-r1-distill-llama-70b",
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await groqRes.json();
    res.status(200).json({ answer: data.choices?.[0]?.message?.content });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
}
