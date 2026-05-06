export const GET_GLOBAL_STATS = `
  query GetGlobalStats {
    getGlobalStats {
      totalUsers
      totalProfessors
      totalProjects
      activeSubjects
      projectsAdoption {
        month
        count
      }
    }
  }
`;

export const ADMIN_GET_USERS = `
  query AdminGetUsers($skip: Int, $take: Int, $search: String) {
    adminGetUsers(skip: $skip, take: $take, search: $search) {
      totalCount
      items {
        id
        name
        email
        avatarUrl
        isAdmin
        createdAt
      }
    }
  }
`;

export const ADMIN_UPDATE_ROLE = `
  mutation AdminUpdateRole($userId: String!, $isAdmin: Boolean!) {
    adminUpdateUserRole(userId: $userId, isAdmin: $isAdmin) {
      id
      isAdmin
    }
  }
`;

export const ADMIN_DISABLE_USER = `
  mutation AdminDisableUser($userId: String!) {
    adminDisableUser(userId: $userId) {
      id
      isActive
    }
  }
`;

export const GET_ALL_SUBJECTS = `
  query GetAllSubjects {
    subjects {
      id
      name
      code
      period
      professors {
        id
        name
        email
        avatarUrl
      }
    }
  }
`;

export const GET_PROFESSORS_FOR_SELECT = `
  query GetProfessorsForSelect {
    adminGetUsers(skip: 0, take: 500, search: "") {
      items {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_SUBJECT = `
  mutation UpdateSubject($input: UpdateSubjectInput!) {
    updateSubject(updateSubjectInput: $input) {
      id
    }
  }
`;

export const CREATE_SUBJECT = `
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(input: $input) {
      id
    }
  }
`;

export const ADMIN_GET_PROJECTS = `
  query AdminGetProjects($skip: Int!, $take: Int!, $search: String, $active: Boolean) {
    adminGetProjects(skip: $skip, take: $take, search: $search, active: $active) {
      total
      items {
        id
        name
        description
        status
        isArchived
        isPublic
        isInstitutional
        createdAt
        updatedAt
        owner {
          id
          name
          email
        }
        subject {
          id
          name
          code
        }
      }
    }
  }
`;

export const ADMIN_DELETE_PROJECT = `
  mutation AdminForceDeleteProject($projectId: String!) {
    adminForceDeleteProject(projectId: $projectId)
  }
`;

export const ADMIN_GET_PROJECT_DETAILS = `
  query AdminGetProjectDetails($id: String!) {
    adminGetProjectDetails(id: $id) {
      id name description status methodology isPublic isArchived
      createdAt updatedAt isInstitutional mode
      subject {
        name code
        professors { name email }
      }
      members {
        role
        user { name email avatarUrl }
      }
      repositories { name url }
      wallet { balance } 
    }
  }
`;

export const ADMIN_GET_SYSTEM_DATA = `
  query AdminGetSystemData {
    adminGetSettings {
      id
      activePeriod
      allowNewProjects
      maintenanceMode
    }
    adminGetAnnouncements {
      id
      title
      message
      type
      isActive
      createdAt
    }
  }
`;

export const ADMIN_UPDATE_SETTINGS = `
  mutation AdminUpdateSettings($activePeriod: String, $allowNewProjects: Boolean, $maintenanceMode: Boolean) {
    adminUpdateSettings(activePeriod: $activePeriod, allowNewProjects: $allowNewProjects, maintenanceMode: $maintenanceMode) {
      id
      activePeriod
      allowNewProjects
      maintenanceMode
    }
  }
`;

export const ADMIN_CREATE_ANNOUNCEMENT = `
  mutation AdminCreateAnnouncement($title: String!, $message: String!, $type: String!) {
    adminCreateAnnouncement(title: $title, message: $message, type: $type) {
      id
      title
    }
  }
`;

export const ADMIN_TOGGLE_ANNOUNCEMENT = `
  mutation AdminToggleAnnouncement($id: String!, $isActive: Boolean!) {
    adminToggleAnnouncement(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;
