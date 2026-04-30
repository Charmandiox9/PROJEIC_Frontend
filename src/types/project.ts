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

export interface Repository {
  id: String;
  name: String;
  owner: String;
  repoName: String;
}

export interface LocalizedString {
  es: string;
  en?: string;
  pt?: string;
}

export interface Project {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
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
  repositories: Repository[];
}
