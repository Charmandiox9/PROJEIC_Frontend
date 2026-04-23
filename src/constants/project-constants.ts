export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  STARTING: "Iniciando",
  COMPLETED: "Completado",
  ON_HOLD: "En pausa",
  CANCELLED: "Cancelado",
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  STARTING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const ROLE_OPTIONS = [
  { value: "LEADER", label: "Líder" },
  { value: "STUDENT", label: "Estudiante" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "EXTERNAL", label: "Externo" },
];

export const UCN_DOMAINS = ["@alumnos.ucn.cl", "@ucn.cl", "@ce.ucn.cl"];
