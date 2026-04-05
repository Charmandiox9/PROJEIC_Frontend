export interface ProjectUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ProjectMember {
  id: string;
  role: string;
  status: string;
  user: ProjectUser;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  methodology: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  members: ProjectMember[];
  myRole?: string;
}

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

export function isValidUcnEmail(email: string): boolean {
  return UCN_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
