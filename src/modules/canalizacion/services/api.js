const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybsQt-g22sd1-90BycwEY0CDa4e7VYfmt9iAlTQW5jq_UbMRloXXkicJ6v3-5E0QSN/exec";

export const enviarFormulario = async (data) => {
  const payload = {
    ...data,

    // Arrays → string
    grupo_poblacional: Array.isArray(data.grupo_poblacional)
      ? data.grupo_poblacional.join(", ")
      : (data.grupo_poblacional || ""),

    sectores: Array.isArray(data.sectores)
      ? data.sectores.join(", ")
      : (data.sectores || ""),

    subsectores: Array.isArray(data.subsectores)
      ? data.subsectores.join(", ")
      : (data.subsectores || ""),

    acciones: Array.isArray(data.acciones)
      ? data.acciones.join(", ")
      : (data.acciones || ""),

    // 🔥 CORREGIDO: entorno
    entorno_actividad: Array.isArray(data.entorno_actividad)
      ? data.entorno_actividad.join(", ")
      : (data.entorno_actividad || data.entorno || ""),

    // 🔥 CORREGIDO: descripción
    descripcion_solicitud:
      data.descripcion_solicitud ||
      data.descripcion ||
      ""
  };

  // 🔍 DEBUG (puedes quitar luego)
  console.log("Payload enviado:", payload);

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors", //
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};