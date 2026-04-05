export const GET_EXPECTED_RESULTS = `
  query GetExpectedResults($projectId: String!) {
    expectedResultsByProject(projectId: $projectId) {
      id
      projectId
      title
      description
      status
      progress
      createdAt
      owner {
        userId
        name
        avatarUrl
      }
      evidences {
        id
        type
        url
        fileKey
        createdAt
      }
      history {
        id
        previousStatus
        newStatus
        reason
        createdAt
      }
      tasks {
        id
        title
        status
      }
    }
  }
`;

export const CREATE_EXPECTED_RESULT = `
  mutation CreateExpectedResult($input: CreateExpectedResultInput!) {
    createExpectedResult(input: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_RESULT_STATUS = `
  mutation UpdateResultStatus($input: UpdateResultStatusInput!) {
    updateResultStatus(input: $input) {
      id
      status
      progress
    }
  }
`;

export const CREATE_TASK = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(createTaskInput: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_TASK = `
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(updateTaskInput: $input) {
      id
      title
      status
    }
  }
`;

export const REMOVE_TASK = `
  mutation RemoveTask($id: String!) {
    removeTask(id: $id) {
      id
    }
  }
`;
