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

export const GET_UPLOAD_PRESIGNED_URL = `
  mutation GetUploadPresignedUrl($fileName: String!, $contentType: String!) {
    getUploadPresignedUrl(fileName: $fileName, contentType: $contentType) {
      uploadUrl
      fileKey
    }
  }
`;