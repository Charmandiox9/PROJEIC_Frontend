export interface Subject {
  id: string;
  name: string;
  code?: string;
  period: string;
  professors?: ProjectUser[];
}

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
  isInstitutional: boolean;
  subject?: Subject;
  members: ProjectMember[];
  myRole?: string;
  mode?: string;
  professor?: { id: string; name: string }[];
  githubOwner?: string;
  githubRepo?: string;
}
