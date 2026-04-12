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

export const CREATE_BOARD = `
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(createBoardInput: $input) {
      id
      name
      position
      color
      wipLimit
    }
  }
`;
