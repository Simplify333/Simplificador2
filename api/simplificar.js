export default async function handler(req, res) {
  const { texto } = await req.json();

  const prompt = `
Eres un asistente que simplifica textos legales para ciudadanos comunes. 
Usa lenguaje claro y directo. Explica qué tiene que hacer la persona, paso a paso.
Texto original: """${texto}"""
`;

  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer TU_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    })
  });

  const data = await respuesta.json();
  res.status(200).json({ resultado: data.choices?.[0]?.message?.content || "Error" });
}
