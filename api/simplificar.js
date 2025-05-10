export default async function handler(req, res) {
  try {
    const bodyText = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    let texto;
    try {
      const parsed = JSON.parse(bodyText);
      texto = parsed.texto;
    } catch {
      console.error("❌ Error: cuerpo no es JSON válido");
      return res.status(400).json({ error: "El cuerpo no es JSON válido" });
    }

    if (!texto) {
      console.error("❌ Error: texto vacío o no enviado");
      return res.status(400).json({ error: "No se recibió texto" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log("🔐 apiKey cargada:", !!apiKey); // solo dice si existe o no

    const prompt = `
Eres un asistente que simplifica textos legales para ciudadanos comunes. 
Usa lenguaje claro y directo. Explica qué tiene que hacer la persona, paso a paso.
Texto original: """${texto}"""
`;

    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await respuesta.json();

    const contenido = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      resultado: contenido || "Respuesta vacía"
    });

  } catch (error) {
    console.error("❌ ERROR INTERNO:", error);
    return res.status(500).json({ error: "Error interno", detalle: error.message });
  }
}
