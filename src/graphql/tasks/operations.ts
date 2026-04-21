export const CREATE_TASK = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(createTaskInput: $input) {
      id
      title
      description
      status
      priority
      position
      startDate
      dueDate
      boardId
      assigneeId
      sprintId
      expectedResultId
      createdAt
      tags
    }
  }
`;

export const UPDATE_TASK = `
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(updateTaskInput: $input) {
      id
      title
      description
      status
      priority
      position
      startDate
      dueDate
      boardId
      assigneeId
      sprintId
      expectedResultId
      updatedAt
      tags
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

export const GET_TASKS_BY_PROJECT = `
  query GetTasksByProject($projectId: String!, $sprintId: String) {
    tasksByProject(projectId: $projectId, sprintId: $sprintId) {
      id
      title
      description
      status
      priority
      position
      startDate
      dueDate
      boardId
      assigneeId
      sprintId 
      expectedResultId
      createdAt
      updatedAt
      tags
      comments {
        id
        content
        createdAt
        author {
          userId
          name
          avatarUrl
        }
      }
    }
  }
`;

export const GET_PENDING_TASKS_BY_USER = `
  query GetPendingTasksByUserId {
    pendingTasksByUserId {
      id
      title
      description
      status
      priority
      position
      startDate
      dueDate
      boardId
      assigneeId
      expectedResultId
      createdAt
      tags
      comments {
        id
        content
        createdAt
        author {
          userId
          name
          avatarUrl
        }
      }
    }
  }
`;

export const ADD_COMMENT_TO_TASK = `
  mutation AddCommentToTask($taskId: String!, $content: String!) {
    addCommentToTask(taskId: $taskId, content: $content) {
      id
      content
      createdAt
      author {
        userId
        name
        avatarUrl
      }
    }
  }
`;
