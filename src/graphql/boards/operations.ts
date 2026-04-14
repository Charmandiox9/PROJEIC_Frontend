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

export const DELETE_BOARD = `
  mutation removeBoard($id: String!) {
    removeBoard(id: $id) {
      id
    }
  }
`;

export const UPDATE_BOARD = `
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(updateBoardInput: $input) {
      id
      name
      position
      color
      wipLimit
    }
  }
`;
