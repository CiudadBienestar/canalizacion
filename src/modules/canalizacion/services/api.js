const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybsQt-g22sd1-90BycwEY0CDa4e7VYfmt9iAlTQW5jq_UbMRloXXkicJ6v3-5E0QSN/exec";

export const enviarFormulario = async (data) => {
  const payload = {
    tipo_documento:       data.tipo_documento,
    numero_documento:     data.numero_documento,
    nombres:              data.nombres,
    apellidos:            data.apellidos,
    barrio:               data.barrio,
    direccion:            data.direccion,
    telefono:             data.telefono,
    correo:               data.correo,

    beneficiario_nombre:    data.beneficiario_nombre,
    beneficiario_telefono:  data.beneficiario_telefono,

    // Arrays → string
    grupo_poblacional:    (data.grupo_poblacional || []).join(", "),
    curso_vida:           data.curso_vida,

    // ✅ Bug corregido: el estado usa "entorno", el GAS espera "entorno_actividad"
    entorno_actividad:    (data.entorno || []).join(", "),

    eps:                  data.eps,
    ips:                  data.ips,

    // ✅ Bug corregido: el estado usa "descripcion", el GAS espera "descripcion_solicitud"
    descripcion_solicitud: data.descripcion,

    sectores:             (data.sectores || []).join(", "),
    subsectores:          (data.subsectores || []).join(", "),
    sector_otro:          data.sector_otro,
    acciones:             (data.acciones || []).join(", "),
    accion_otra:          data.accion_otra,

    responsable:          data.responsable,
    telefono_responsable: data.telefono_responsable,
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
