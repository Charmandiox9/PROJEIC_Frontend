export const GET_BOARDS_BY_PROJECT = `
  query GetBoardsByProject($projectId: String!) {
    boardsByProject(projectId: $projectId) {
      id
      name
      position
      color
      wipLimit
    }
  }
`;
