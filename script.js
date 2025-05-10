document.getElementById('simplificar').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.innerHTML = "Procesando...";

  let texto = document.getElementById('input').value.trim();
  const file = document.getElementById('fileInput').files[0];

  if (!texto && file) {
    texto = await extraerTextoDePDF(file);
  }

  if (!texto) {
    output.innerText = "Por favor, pega un texto o sube un archivo PDF.";
    return;
  }

  const prompt = `
Eres un asistente que simplifica textos legales para ciudadanos comunes. 
Usa lenguaje claro y directo. Explica qué tiene que hacer la persona, paso a paso.
Texto original: """${texto}"""
`;

  const respuesta = await fetch("/api/simplificar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ texto })
});

const data = await respuesta.json();
output.innerText = data.resultado || "Error al procesar.";

});

async function extraerTextoDePDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function() {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let texto = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(" ");
        texto += pageText + "\n";
      }
      resolve(texto);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('input').value = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('output').innerHTML = '';
});

document.getElementById('copiar').addEventListener('click', () => {
  const texto = document.getElementById('output').innerText;
  if (!texto) {
    alert("No hay texto para copiar.");
    return;
  }

  navigator.clipboard.writeText(texto)
    .then(() => {
      alert("Texto copiado al portapapeles.");
    })
    .catch(() => {
      alert("Error al copiar.");
    });
});