export const GET_ALL_SUBJECTS = `
  query GetAllSubjects {
    subjects {
      id
      name
      period
    }
  }
`;

export const CREATE_SUBJECT = `
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(createSubjectInput: $input) {
      id
      name
      code
      period
      professors {
        id
        name
        email
      }
    }
  }
`;

export const COUNT_SEMESTERS = `
query CountSemesters {
  countSemesters
}
`;

export const COUNT_SUBJECTS = `
query CountSubjects {
  countSubjects
}
`;
