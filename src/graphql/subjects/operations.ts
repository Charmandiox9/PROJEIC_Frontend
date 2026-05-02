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

export const GET_MY_TAUGHT_SUBJECTS = `
  query GetMyTaughtSubjects {
    getMyTaughtSubjects {
      id
      name
      code
      period
    }
  }
`;

export const GET_SUBJECT_CATALOG = `
  query GetSubjectCatalog($subjectId: String!) {
    getSubjectCatalog(subjectId: $subjectId) {
      id
      name
      description
      basePrice
      cycle
    }
  }
`;

export const CREATE_CATALOG_ITEM = `
  mutation CreateCatalogItem($input: CreateCatalogItemInput!) {
    createCatalogItem(input: $input) {
      id
    }
  }
`;

export const DELETE_CATALOG_ITEM = `
  mutation DeleteCatalogItem($id: String!) {
    deleteCatalogItem(id: $id)
  }
`;
