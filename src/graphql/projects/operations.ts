// gql es un tagged template literal que simplemente retorna el string.
// No necesitamos Apollo Client — el proyecto usa fetchGraphQL directo.
const gql = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

// ─── Fragments ────────────────────────────────────────────────────────────────

const PROJECT_FIELDS = `
  fragment ProjectFields on Project {
    id
    name
    description
    color
    status
    methodology
    isPublic
    isArchived
    createdAt
    updatedAt
    mode
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * GET_PROJECTS
 * Lista paginada de proyectos con filtros opcionales.
 *
 * Variables:
 *   filter?: {
 *     status?:          ProjectStatus       (STARTING | ACTIVE | ON_HOLD | COMPLETED | CANCELLED)
 *     methodology?:     ProjectMethodology  (KANBAN | SCRUM | SCRUMBAN)
 *     isPublic?:        boolean
 *     includeArchived?: boolean             (default: false)
 *     search?:          string              (búsqueda por nombre, case-insensitive)
 *     take?:            number              (default: 20, máx: 100)
 *     skip?:            number              (default: 0)
 *   }
 */
export const GET_PROJECTS = `
  ${PROJECT_FIELDS}
  query GetProjects($filter: ProjectsFilterInput) {
    projects(filter: $filter) {
      items {
        ...ProjectFields
      }
      total
      skip
      take
    }
  }
`;

/**
 * GET_PROJECT
 * Trae un proyecto por su ID.
 * Lanza error NOT_FOUND si no existe.
 *
 * Variables:
 *   id: string  (cuid del proyecto)
 */
export const GET_PROJECT = `
  ${PROJECT_FIELDS}
  query GetProject($id: ID!) {
    project(id: $id) {
      ...ProjectFields
    }
  }
`;

/**
 * GET_PUBLIC_PROJECTS
 * Lista proyectos públicos y no archivados para la página pública.
 * Incluye members con avatar. No requiere autenticación.
 *
 * Variables:
 *   filter?: {
 *     search?:          string
 *     status?:          ProjectStatus
 *     take?:            number
 *     skip?:            number
 *     isPublic?:        boolean
 *     includeArchived?: boolean
 *   }
 */
export const GET_PUBLIC_PROJECTS = `
  query GetPublicProjects($filter: ProjectsFilterInput) {
    projects(filter: $filter) {
      items {
        id
        name
        description
        color
        status
        methodology
        isPublic
        isArchived
        createdAt
        updatedAt
        members {
          id
          role
          user {
            id
            name
            avatarUrl
          }
        }
      }
      total
      skip
      take
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * CREATE_PROJECT
 * Variables:
 *   input: { name, description?, color?, status?, methodology?, isPublic? }
 */
export const CREATE_PROJECT = `
  ${PROJECT_FIELDS}
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...ProjectFields
    }
  }
`;

/**
 * UPDATE_PROJECT
 * Variables:
 *   input: { id, name?, description?, color?, status?, methodology?, isPublic? }
 */
export const UPDATE_PROJECT = `
  ${PROJECT_FIELDS}
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      ...ProjectFields
    }
  }
`;

/**
 * ARCHIVE_PROJECT
 * Soft-delete — isArchived = true. El proyecto sigue en la DB.
 * Variables:
 *   id: string
 */
export const ARCHIVE_PROJECT = `
  ${PROJECT_FIELDS}
  mutation ArchiveProject($id: ID!) {
    archiveProject(id: $id) {
      ...ProjectFields
    }
  }
`;

/**
 * DELETE_PROJECT
 * Hard-delete — elimina permanentemente con cascada.
 * Variables:
 *   id: string
 */
export const DELETE_PROJECT = `
  ${PROJECT_FIELDS}
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      ...ProjectFields
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | "STARTING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type ProjectMethodology = "KANBAN" | "SCRUM" | "SCRUMBAN";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  methodology: ProjectMethodology;
  isPublic: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  myRole?: string;
}

export interface PaginatedProjects {
  items: Project[];
  total: number;
  skip: number;
  take: number;
}

export interface ProjectsFilterInput {
  status?: ProjectStatus;
  methodology?: ProjectMethodology;
  isPublic?: boolean;
  includeArchived?: boolean;
  search?: string;
  take?: number;
  skip?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  methodology?: ProjectMethodology;
  isPublic?: boolean;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  methodology?: ProjectMethodology;
  isPublic?: boolean;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PublicProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PublicProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  methodology: ProjectMethodology;
  isPublic: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members: PublicProjectMember[];
}

export interface GetPublicProjectsData {
  projects: {
    items: PublicProject[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface GetPublicProjectsVars {
  filter?: ProjectsFilterInput;
}

// ─── Query/Mutation response shapes ──────────────────────────────────────────

export interface GetProjectsData {
  projects: PaginatedProjects;
}

export interface GetProjectData {
  project: Project;
}

export interface CreateProjectData {
  createProject: Project;
}

export interface UpdateProjectData {
  updateProject: Project;
}

export interface ArchiveProjectData {
  archiveProject: Project;
}

export interface DeleteProjectData {
  deleteProject: Project;
}

// ─── Project Detail (para el modal) ──────────────────────────────────────────

/**
 * GET_PROJECT_DETAIL
 * Trae un proyecto completo con todos sus miembros para el modal de detalle.
 * Variables: id: string
 */
export const GET_PROJECT_DETAIL = `
  query GetProjectDetail($id: ID!) {
    project(id: $id) {
      id
      name
      description
      color
      status
      methodology
      isPublic
      isArchived
      createdAt
      updatedAt
      members {
        id
        role
        joinedAt
        user {
          id
          name
          avatarUrl
        }
      }
    }
  }
`;

export interface ProjectDetailMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  methodology: ProjectMethodology;
  isPublic: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members: ProjectDetailMember[];
}

export interface GetProjectDetailData {
  project: ProjectDetail;
}
