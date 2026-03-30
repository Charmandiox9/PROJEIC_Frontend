export const GET_PROFILE = `
  query Me {
    me {
      userId
      email
      name
      avatarUrl
      isAdmin
    }
  }
`;

export const GET_PUBLIC_PROJECTS = `
  query GetPublicProjects($skip: Int, $take: Int) {
    findAll(filter: { isPublic: true, skip: $skip, take: $take }) {
      items {
        id
        name
        description
        color
        status
        methodology
        isPublic
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

export const GET_MY_PROJECTS = `
  query GetMyProjects($skip: Int, $take: Int) {
    myProjects(filter: { skip: $skip, take: $take }, includeMembers: true) {
      items {
        id
        name
        description
        color
        status
        methodology
        isPublic
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
    }
  }
`;

export const GET_PROJECT_BY_ID = `
  query GetProjectById($id: String!) {
    findOne(id: $id) {
      id
      name
      description
      color
      status
      methodology
      isPublic
      createdAt
      updatedAt
      isArchived
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
  }
`;

export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      color
      status
      methodology
      isPublic
    }
  }
`;

export const UPDATE_PROJECT = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      description
      color
      status
      methodology
      isPublic
    }
  }
`;

export const ARCHIVE_PROJECT = `
  mutation ArchiveProject($id: ID!) {
    archiveProject(id: $id) {
      id
      isArchived
    }
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;

export const ADD_PROJECT_MEMBER = `
  mutation AddProjectMember($input: AddProjectMemberInput!) {
    addProjectMember(input: $input) {
      id
      role
      user {
        name
      }
    }
  }
`;

export const REMOVE_PROJECT_MEMBER = `
  mutation RemoveProjectMember($memberId: ID!) {
    removeProjectMember(memberId: $memberId)
  }
`;

export const UPDATE_PROJECT_MEMBER_ROLE = `
  mutation UpdateProjectMemberRole($input: UpdateProjectMemberInput!) {
    updateProjectMemberRole(input: $input) {
      id
      role
    }
  }
`;