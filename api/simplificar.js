export default async function handler(req, res) {
  try {
    const { texto } = await req.json();

    if (!texto) {
      return res.status(400).json({ error: "No se recibió texto" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 👇 Esto lo imprime en los logs de Vercel
    console.log("🔐 API Key desde entorno:", apiKey);

    const prompt = `
Eres un asistente que simplifica textos legales para ciudadanos comunes. 
Usa lenguaje claro y directo. Explica qué tiene que hacer la persona, paso a paso.
Texto original: """${texto}"""
`;

    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await respuesta.json();

    return res.status(200).json({
      resultado: data.choices?.[0]?.message?.content || "Respuesta vacía"
    });

  } catch (error) {
    console.error("❌ ERROR EN LA FUNCIÓN:", error);
    return res.status(500).json({ error: "Error interno", detalle: error.message });
  }
}
console.log("✅ simplificar.js se ejecutó");

