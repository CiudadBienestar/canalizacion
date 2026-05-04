const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybsQt-g22sd1-90BycwEY0CDa4e7VYfmt9iAlTQW5jq_UbMRloXXkicJ6v3-5E0QSN/exec";

export const enviarFormulario = async (data) => {
  const payload = {
    ...data,
    grupo_poblacional: (data.grupo_poblacional || []).join(", "),
    entorno_actividad: (data.entorno || []).join(", "),
    sectores: (data.sectores || []).join(", "),
    subsectores: (data.subsectores || []).join(", "),
    acciones: (data.acciones || []).join(", "),
  };

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
};