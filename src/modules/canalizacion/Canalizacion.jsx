import { useState, useEffect, useRef } from "react";
import { enviarFormulario } from "./services/api";
import { PERSONAS } from "../../data/personas";

// ── Catálogos ──────────────────────────────────────────────────────────────
const TIPOS_DOCUMENTO = [
  "Cédula de Ciudadanía",
  "Tarjeta de Identidad",
  "Cédula de Extranjería",
  "Pasaporte",
  "Registro Civil",
  "Permiso Especial de Permanencia",
  "Permiso de Protección Temporal",
];

const EPS_LIST = [
  "Asmet Salud", "Capital Salud", "Comfamiliar", "Compensar", "Convida",
  "Coomeva", "Coosalud", "Emssanar", "Famisanar", "Mallamas", "Nueva EPS",
  "Proinsalud", "Salud Total", "Saludvida", "Sanitas", "Savia Salud",
  "Sursalud", "Régimen Especial", "Sin Afiliación a Salud", "Otra",
];

const GRUPO_POBLACIONAL = [
  "Discapacidad", "Grupos Étnicos", "Población Víctima de Conflicto Armado",
  "Habitante de Calle", "Población Migrante", "LGBTQ+ / OSIGD", "Campesinos", "No Aplica",
];

const CURSO_VIDA = [
  "Primera infancia (0 meses a 5 años, 11 meses y 29 días)",
  "Infancia (6 a 11 años, 11 meses y 29 días)",
  "Adolescencia (12 a los 17 años)",
  "Juventud (18 hasta los 28 años)",
  "Adultez (29 a los 59 años)",
  "Vejez (Mayor de 60)",
];

const ENTORNOS = ["Comunitario", "Educativo", "Hogar", "Institucional", "Laboral informal"];

const SECTORES = ["Justicia", "Salud", "Protección", "Social", "Otro", "Acciones colectivas"];

const SUBSECTORES = {
  Justicia: ["CAIVAS", "Fiscalía", "SIJIN", "URI-CTI"],
  Protección: ["Comisaría de Familia", "ICBF"],
  Salud: [
    "Pasto Salud ESE", "Bien Nacer / Banco de leche humana", "Certificado Discapacidad",
    "Comisaría de Familia", "EPS - servicios administrativos, atención al usuario",
    "IPS - Centro de salud / Ruta de atención en salud RIAS/Vacunación",
    "Secretaría de Salud (Aseguramiento)", "Secretaría de Salud - Salud Ambiental",
    "Secretaría de Salud - Salud Pública", "SEM - 123",
  ],
  Social: [
    "Bienestar Social", "Desarrollo comunitario", "Educación", "Gestión ambiental",
    "INVIPASTO", "OSIGD", "SISBEN",
  ],
  "Acciones colectivas": [
    "Acción significativa", "Centros de escucha - ZOE", "Cursos virtuales",
    "Grupo EMI", "Medios Radio, TV, Redes sociales Ciudad Bienestar",
    "Proceso formativo", "Proceso Juntanza", "Veeduría Juvenil SSAAJ", "Voluntariado",
  ],
};

const ACCIONES = [
  "Hacer la consulta y luego llamar para brindar información clara",
  "Acompañamiento para activar Ruta de Atención",
  "Gestionar servicio de atención en salud con la IPS",
  "Se hace la explicación del proceso, servicio o ruta de atención de manera clara",
  "Otro",
];

const STEPS = ["Datos generales", "Beneficiario", "Solicitud", "Orientación"];

// ── Helpers UI ─────────────────────────────────────────────────────────────
const inputBase =
  "w-full px-4 py-3 text-base border rounded-lg bg-white text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 border-gray-300";

const inputDisabled =
  "w-full px-4 py-3 text-base border rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed border-gray-200";

const inputErr =
  "w-full px-4 py-3 text-base border rounded-lg bg-white text-gray-900 outline-none transition focus:ring-2 focus:ring-red-100 focus:border-red-400 border-red-400";

const Field = ({ label, optional, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1.5">
      {label}
      {optional && <span className="text-gray-400 font-normal"> (opcional)</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-500 mt-1.5">{error}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <p className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
    {children}
  </p>
);

const CheckItem = ({ label, checked, onChange, size = "base" }) => (
  <label className={`flex items-center gap-3 text-${size} text-gray-700 cursor-pointer select-none`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 accent-blue-600 flex-shrink-0"
    />
    {label}
  </label>
);

// Componente para Radio buttons (selección única)
const RadioItem = ({ label, checked, onChange, name }) => (
  <label className="flex items-center gap-3 text-base text-gray-700 cursor-pointer select-none">
    <input
      type="radio"
      name={name}
      value={label}
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 accent-blue-600 flex-shrink-0"
    />
    {label}
  </label>
);

// ── Autocomplete responsable ───────────────────────────────────────────────
function AutocompleteResponsable({ value, telefono, onChange, onSelect, error }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);

  const filtered = value.length >= 2
    ? PERSONAS.filter((p) => p.nombre.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlighted when filtered list changes
  useEffect(() => { setHighlighted(-1); }, [filtered.length]);

  const handleKeyDown = (e) => {
    if (!open || !filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      onSelect(filtered[highlighted]);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => value.length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Escriba al menos 2 letras para buscar…"
        autoComplete="off"
        className={error ? inputErr : inputBase}
      />
      {open && filtered.length > 0 && (
        <div ref={listRef}
          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto"
          style={{ maxHeight: "280px" }}>
          {filtered.map((p, i) => (
            <button
              key={p.nombre}
              type="button"
              className={`w-full text-left px-4 py-3 text-base transition border-b border-gray-50 last:border-0 ${
                i === highlighted ? "bg-blue-50 text-blue-800" : "text-gray-800 hover:bg-gray-50"
              }`}
              onMouseDown={() => { onSelect(p); setOpen(false); }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="font-medium block">{p.nombre}</span>
              <span className="text-gray-400 text-sm">📞 {p.telefono}</span>
            </button>
          ))}
          {PERSONAS.filter((p) => p.nombre.toLowerCase().includes(value.toLowerCase())).length > 8 && (
            <p className="text-xs text-center text-gray-400 py-2 bg-gray-50">
              Mostrando 8 de {PERSONAS.filter((p) => p.nombre.toLowerCase().includes(value.toLowerCase())).length} resultados — escriba más para filtrar
            </p>
          )}
        </div>
      )}
      {open && value.length >= 2 && filtered.length === 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm text-gray-400">No se encontraron coincidencias</p>
        </div>
      )}
      {telefono && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-700 font-medium">📞 {telefono}</span>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Canalizacion() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mismoSolicitante, setMismoSolicitante] = useState(false);

  const [form, setForm] = useState({
    fecha: "",
    tipo_documento: "",
    numero_documento: "",
    nombres: "",
    apellidos: "",
    barrio: "",
    direccion: "",
    telefono: "",
    correo: "",
    beneficiario_nombre: "",
    beneficiario_telefono: "",

    grupo_poblacional: [],
    curso_vida: "", // Cambiado de [] a "" para selección única
    entorno: [],

    eps: "",
    eps_otra: "",
    ips: "",

    descripcion: "",
    sectores: [],
    subsectores: [],
    sector_otro: "",

    acciones: [],
    accion_otra: "",

    responsable: "",
    telefono_responsable: "",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleArr = (field, value) => {
    setForm((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // Efecto para copiar datos cuando cambia el checkbox o cambian los datos del solicitante
  useEffect(() => {
    if (mismoSolicitante) {
      set("beneficiario_nombre", `${form.nombres} ${form.apellidos}`.trim());
      set("beneficiario_telefono", form.telefono);
    }
  }, [mismoSolicitante, form.nombres, form.apellidos, form.telefono]);

  // Cuando se cambia manualmente el beneficiario, se desmarca el checkbox
  const handleBeneficiarioChange = (campo, valor) => {
    set(campo, valor);
    if (mismoSolicitante) {
      setMismoSolicitante(false);
    }
  };

  // Cuando se marca el checkbox, se copian los datos
  const handleMismoSolicitanteChange = (checked) => {
    setMismoSolicitante(checked);
    if (checked) {
      set("beneficiario_nombre", `${form.nombres} ${form.apellidos}`.trim());
      set("beneficiario_telefono", form.telefono);
    }
  };

  // Cuando se desmarca un sector, limpiar sus subsectores
  const toggleSector = (sector) => {
    setForm((f) => {
      const sectores = f.sectores.includes(sector)
        ? f.sectores.filter((s) => s !== sector)
        : [...f.sectores, sector];
      const subsDisponibles = sectores.flatMap((s) => SUBSECTORES[s] || []);
      const subsectores = f.subsectores.filter((sub) => subsDisponibles.includes(sub));
      return { ...f, sectores, subsectores };
    });
  };

  const validar = () => {
    const e = {};
    if (step === 1) {
      if (!form.tipo_documento) e.tipo_documento = "Selecciona el tipo de documento";
      if (!form.numero_documento) e.numero_documento = "Ingresa el número de documento";
      if (!form.nombres) e.nombres = "Ingresa los nombres";
      if (!form.apellidos) e.apellidos = "Ingresa los apellidos";
      if (!form.barrio) e.barrio = "Ingresa el barrio";
      if (!form.telefono) e.telefono = "Ingresa el número de teléfono";
      if (form.telefono && !/^[0-9]{7,10}$/.test(form.telefono))
        e.telefono = "Teléfono inválido (7–10 dígitos)";
      if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo))
        e.correo = "Correo electrónico inválido";
    }
    if (step === 2) {
      if (!form.grupo_poblacional.length)
        e.grupo_poblacional = "Selecciona al menos una opción";
      if (!form.curso_vida) // Cambiado para validar string no vacío
        e.curso_vida = "Selecciona una opción";
      if (!form.entorno.length)
        e.entorno = "Selecciona al menos un entorno de actividad";
    }
    if (step === 3) {
      if (!form.descripcion) e.descripcion = "Este campo es obligatorio";
      if (!form.sectores.length) e.sectores = "Selecciona al menos un sector";
      // Si algún sector seleccionado tiene subsectores disponibles, exigir al menos uno
      const sectoresConSubs = form.sectores.filter((s) => SUBSECTORES[s]?.length > 0);
      if (sectoresConSubs.length > 0 && form.subsectores.length === 0)
        e.subsectores = "Selecciona al menos una dependencia o institución";
    }
    if (step === 4) {
      if (!form.acciones.length) e.acciones = "Selecciona al menos una acción";
      if (!form.responsable) e.responsable = "Selecciona el responsable";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validar()) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setSubmitting(true);
    try {
      await enviarFormulario(form);
      setDone(true);
    } catch {
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const BtnRow = ({ onBack, onNext, submitLabel }) => (
    <div className="flex flex-col gap-4 mt-8 sm:flex-row">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-base font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          ← Atrás
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Siguiente →
        </button>
      )}
      {submitLabel && (
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition"
        >
          {submitting ? "Guardando…" : submitLabel}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Registro de Solicitudes Ciudadanas
        </h1>

        {/* Step labels */}
        <div className="flex justify-between mb-2">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`text-sm ${step === i + 1 ? "text-blue-600 font-semibold" : "text-gray-400"}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-8">
          <div
            className="h-1.5 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-10">
          <form onSubmit={handleSubmit}>
            {/* ══ PASO 1: Datos generales ══════════════════════════════════ */}
            {step === 1 && (
              <>
                <SectionTitle>I. Datos del solicitante</SectionTitle>

                <div className="mb-5">
                  <Field label="Fecha de registro">
                    <input
                      type="date"
                      value={form.fecha}
                      onChange={(e) => set("fecha", e.target.value)}
                      className={inputBase}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                  <Field label="Tipo de documento" error={errors.tipo_documento}>
                    <select
                      value={form.tipo_documento}
                      onChange={(e) => set("tipo_documento", e.target.value)}
                      className={errors.tipo_documento ? inputErr : inputBase}
                    >
                      <option value="">Seleccionar…</option>
                      {TIPOS_DOCUMENTO.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Número de documento" error={errors.numero_documento}>
                    <input
                      value={form.numero_documento}
                      placeholder=""
                      onChange={(e) => set("numero_documento", e.target.value)}
                      className={errors.numero_documento ? inputErr : inputBase}
                    />
                  </Field>

                  <Field label="Nombres" error={errors.nombres}>
                    <input
                      value={form.nombres}
                      placeholder="Nombres completos"
                      onChange={(e) => set("nombres", e.target.value)}
                      className={errors.nombres ? inputErr : inputBase}
                    />
                  </Field>

                  <Field label="Apellidos" error={errors.apellidos}>
                    <input
                      value={form.apellidos}
                      placeholder="Apellidos completos"
                      onChange={(e) => set("apellidos", e.target.value)}
                      className={errors.apellidos ? inputErr : inputBase}
                    />
                  </Field>
                </div>

                <div className="mb-5">
                  <Field label="Barrio" error={errors.barrio}>
                    <input
                      value={form.barrio}
                      placeholder=""
                      onChange={(e) => set("barrio", e.target.value)}
                      className={errors.barrio ? inputErr : inputBase}
                    />
                  </Field>
                </div>

                <div className="mb-5">
                  <Field label="Dirección de residencia" optional>
                    <input
                      value={form.direccion}
                      placeholder=""
                      onChange={(e) => set("direccion", e.target.value)}
                      className={inputBase}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                  <Field label="Teléfono" error={errors.telefono}>
                    <input
                      value={form.telefono}
                      placeholder=""
                      onChange={(e) => set("telefono", e.target.value)}
                      className={errors.telefono ? inputErr : inputBase}
                    />
                  </Field>

                  <Field label="Correo electrónico" optional error={errors.correo}>
                    <input
                      value={form.correo}
                      placeholder="correo@ejemplo.com"
                      onChange={(e) => set("correo", e.target.value)}
                      className={errors.correo ? inputErr : inputBase}
                    />
                  </Field>
                </div>

                <BtnRow onNext={next} />
              </>
            )}

            {/* ══ PASO 2: Beneficiario ═════════════════════════════════════ */}
            {step === 2 && (
              <>
                <SectionTitle>II. Datos de la persona beneficiaria</SectionTitle>

                {/* Checkbox para indicar si es el mismo solicitante */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckItem
                    label="✓ El beneficiario es la misma persona que el solicitante"
                    checked={mismoSolicitante}
                    onChange={(e) => handleMismoSolicitanteChange(e.target.checked)}
                    size="base"
                  />
                  <p className="text-xs text-blue-600 mt-2 ml-8">
                    Marque esta opción si el beneficiario es la misma persona que diligenció los datos generales
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                  <Field label="Nombre del beneficiario" optional>
                    <input
                      value={form.beneficiario_nombre}
                      placeholder="Nombre completo"
                      onChange={(e) => handleBeneficiarioChange("beneficiario_nombre", e.target.value)}
                      disabled={mismoSolicitante}
                      className={mismoSolicitante ? inputDisabled : inputBase}
                    />
                  </Field>

                  <Field label="Teléfono del beneficiario" optional>
                    <input
                      value={form.beneficiario_telefono}
                      placeholder="Ej: 3009876543"
                      onChange={(e) => handleBeneficiarioChange("beneficiario_telefono", e.target.value)}
                      disabled={mismoSolicitante}
                      className={mismoSolicitante ? inputDisabled : inputBase}
                    />
                  </Field>
                </div>

                {/* Mostrar un mensaje informativo cuando está marcado el checkbox */}
                {mismoSolicitante && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ℹ️ Los datos del beneficiario se están copiando automáticamente del solicitante.
                      {form.telefono && ` Teléfono: ${form.telefono}`}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-8 mb-6 md:grid-cols-2">
                  {/* Grupo poblacional - múltiple selección */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Grupo poblacional <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-col gap-3">
                      {GRUPO_POBLACIONAL.map((op) => (
                        <CheckItem
                          key={op}
                          label={op}
                          checked={form.grupo_poblacional.includes(op)}
                          onChange={() => toggleArr("grupo_poblacional", op)}
                        />
                      ))}
                    </div>
                    {errors.grupo_poblacional && (
                      <p className="text-sm text-red-500 mt-2">{errors.grupo_poblacional}</p>
                    )}
                  </div>

                  {/* Curso de vida - SELECCIÓN ÚNICA (Radio buttons) */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Curso de vida <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-col gap-3">
                      {CURSO_VIDA.map((op) => (
                        <RadioItem
                          key={op}
                          label={op}
                          name="curso_vida"
                          checked={form.curso_vida === op}
                          onChange={() => set("curso_vida", op)}
                        />
                      ))}
                    </div>
                    {errors.curso_vida && (
                      <p className="text-sm text-red-500 mt-2">{errors.curso_vida}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Entorno de la actividad <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {ENTORNOS.map((op) => (
                      <CheckItem
                        key={op}
                        label={op}
                        checked={form.entorno.includes(op)}
                        onChange={() => toggleArr("entorno", op)}
                      />
                    ))}
                  </div>
                  {errors.entorno && (
                    <p className="text-sm text-red-500 mt-2">{errors.entorno}</p>
                  )}
                </div>

                {/* EPS */}
                <div className="grid grid-cols-1 gap-5 mb-2 md:grid-cols-2">
                  <div>
                    <Field label="EPS a la que está afiliado" optional>
                      <select
                        value={form.eps}
                        onChange={(e) => set("eps", e.target.value)}
                        className={inputBase}
                      >
                        <option value="">Seleccionar…</option>
                        {EPS_LIST.map((e) => (
                          <option key={e}>{e}</option>
                        ))}
                      </select>
                    </Field>
                    {form.eps === "Otra" && (
                      <div className="mt-2">
                        <input
                          value={form.eps_otra}
                          placeholder="¿Cuál EPS?"
                          onChange={(e) => set("eps_otra", e.target.value)}
                          className={inputBase}
                        />
                      </div>
                    )}
                  </div>

                  <Field label="Centro de salud o IPS" optional>
                    <input
                      value={form.ips}
                      placeholder="Nombre del centro / IPS"
                      onChange={(e) => set("ips", e.target.value)}
                      className={inputBase}
                    />
                  </Field>
                </div>

                <BtnRow onBack={back} onNext={next} />
              </>
            )}

            {/* ══ PASO 3: Solicitud ciudadana ══════════════════════════════ */}
            {step === 3 && (
              <>
                <SectionTitle>III. Solicitud ciudadana</SectionTitle>

                <div className="mb-6">
                  <Field
                    label="Describa las circunstancias, razones o situaciones que motivan la solicitud"
                    error={errors.descripcion}
                  >
                    <textarea
                      value={form.descripcion}
                      placeholder="Describa brevemente la situación…"
                      onChange={(e) => set("descripcion", e.target.value)}
                      className={`${errors.descripcion ? inputErr : inputBase} resize-y min-h-32`}
                    />
                  </Field>
                </div>

                {/* Selección de sectores */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Seleccione la dependencia o institución a la cual debe dirigirse la persona canalizada
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {SECTORES.map((s) => (
                      <CheckItem
                        key={s}
                        label={`Sector ${s}`}
                        checked={form.sectores.includes(s)}
                        onChange={() => toggleSector(s)}
                      />
                    ))}
                  </div>
                  {errors.sectores && <p className="text-sm text-red-500 mt-2">{errors.sectores}</p>}
                </div>

                {/* Campo libre si selecciona "Otro" */}
                {form.sectores.includes("Otro") && (
                  <div className="mb-4">
                    <Field label="¿Cuál sector?">
                      <input
                        value={form.sector_otro}
                        placeholder="Especifique el sector"
                        onChange={(e) => set("sector_otro", e.target.value)}
                        className={inputBase}
                      />
                    </Field>
                  </div>
                )}

                {/* Subsectores dinámicos por cada sector seleccionado */}
                {form.sectores
                  .filter((s) => SUBSECTORES[s])
                  .map((sector) => (
                    <div
                      key={sector}
                      className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-lg"
                    >
                      <p className="text-sm font-semibold text-blue-700 mb-3">
                        Sector {sector}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {SUBSECTORES[sector].map((sub) => (
                          <CheckItem
                            key={sub}
                            label={sub}
                            size="sm"
                            checked={form.subsectores.includes(sub)}
                            onChange={() => toggleArr("subsectores", sub)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                {errors.subsectores && (
                  <p className="text-sm text-red-500 mb-4">{errors.subsectores}</p>
                )}

                <BtnRow onBack={back} onNext={next} />
              </>
            )}

            {/* ══ PASO 4: Orientación ══════════════════════════════════════ */}
            {step === 4 && !done && (
              <>
                <SectionTitle>IV. Orientación brindada y compromisos</SectionTitle>

                {/* Acciones */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Identifique la acción para el desarrollo de la gestión
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    La respuesta no debe superar los 15 días a partir de la fecha de la consulta.
                  </p>
                  <div className="flex flex-col gap-3">
                    {ACCIONES.map((a) => (
                      <CheckItem
                        key={a}
                        label={a}
                        checked={form.acciones.includes(a)}
                        onChange={() => toggleArr("acciones", a)}
                      />
                    ))}
                  </div>
                  {errors.acciones && <p className="text-sm text-red-500 mt-2">{errors.acciones}</p>}

                  {form.acciones.includes("Otro") && (
                    <div className="mt-3">
                      <input
                        value={form.accion_otra}
                        placeholder="¿Cuál acción?"
                        onChange={(e) => set("accion_otra", e.target.value)}
                        className={inputBase}
                      />
                    </div>
                  )}
                </div>

                {/* Responsable con autocomplete */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Responsable de diligenciamiento" error={errors.responsable}>
                    <AutocompleteResponsable
                      value={form.responsable}
                      telefono={form.telefono_responsable}
                      error={errors.responsable}
                      onChange={(val) => {
                        set("responsable", val);
                        set("telefono_responsable", "");
                      }}
                      onSelect={(p) => {
                        set("responsable", p.nombre);
                        set("telefono_responsable", p.telefono);
                      }}
                    />
                  </Field>

                  <Field label="Teléfono del responsable" optional>
                    <input
                      value={form.telefono_responsable}
                      placeholder="Se completa automáticamente"
                      onChange={(e) => set("telefono_responsable", e.target.value)}
                      className={inputBase}
                    />
                  </Field>
                </div>

                <BtnRow onBack={back} submitLabel="Guardar registro" />
              </>
            )}

            {/* ══ ÉXITO ════════════════════════════════════════════════════ */}
            {done && (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Registro guardado
                </p>
                <p className="text-base text-gray-500 mb-6">
                  La solicitud fue registrada correctamente.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setDone(false);
                    setMismoSolicitante(false);
                    setErrors({});
                    setForm((f) => ({
                      ...f,
                      tipo_documento: "",
                      numero_documento: "",
                      nombres: "",
                      apellidos: "",
                      barrio: "",
                      direccion: "",
                      telefono: "",
                      correo: "",
                      beneficiario_nombre: "",
                      beneficiario_telefono: "",
                      grupo_poblacional: [],
                      curso_vida: "",
                      entorno: [],
                      eps: "",
                      eps_otra: "",
                      ips: "",
                      descripcion: "",
                      sectores: [],
                      subsectores: [],
                      sector_otro: "",
                      acciones: [],
                      accion_otra: "",
                      responsable: "",
                      telefono_responsable: "",
                      fecha: "",
                    }));
                  }}
                  className="px-8 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Nuevo registro
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
