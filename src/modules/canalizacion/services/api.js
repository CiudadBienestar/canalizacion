export const enviarFormulario = async (data) => {
  // 🔧 Transformar arrays → texto
  const payload = {
    ...data,
    grupo_poblacional: data.grupo_poblacional.join(", "),
    entorno: data.entorno.join(", "),
    sectores: data.sectores.join(", "),
    subsectores: data.subsectores.join(", "),
    acciones: data.acciones.join(", "),
  };

  console.log("📤 Enviando a Google:", payload); //

  const res = await fetch("https://script.google.com/macros/s/AKfycbybsQt-g22sd1-90BycwEY0CDa4e7VYfmt9iAlTQW5jq_UbMRloXXkicJ6v3-5E0QSN/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text(); // 👈 importante para ver errores reales

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Respuesta no es JSON: " + text);
  }
};