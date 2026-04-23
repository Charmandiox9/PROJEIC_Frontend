export const GET_SPRINTS_BY_PROJECT = `
  query GetSprintsByProject($projectId: String!) {
    sprintsByProject(projectId: $projectId) {
      id
      name
      goal
      status
      startDate
      endDate
      projectId
    }
  }
`;

export const CREATE_SPRINT = `
  mutation CreateSprint($input: CreateSprintInput!) {
    createSprint(input: $input) {
      id
      name
      goal
      status
      startDate
      endDate
      projectId
    }
  }
`;

export const START_SPRINT = `
  mutation StartSprint($id: String!, $projectId: String!) {
    startSprint(id: $id, projectId: $projectId) {
      id
      name
      status
      startDate
    }
  }
`;

export const COMPLETE_SPRINT = `
  mutation CompleteSprint($id: String!) {
    completeSprint(id: $id) {
      id
      name
      status
      endDate
    }
  }
`;
