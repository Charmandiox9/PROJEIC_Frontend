// NOTA TÉCNICA: El backend aún no implementa el query recentProjects ni sus tipos resultantes.
export const GET_RECENT_PROJECTS = `
  query GetRecentProjects {
    recentProjects {
      id
      title
      status
      description
      progress
      members {
        id
        avatarUrl
      }
    }
  }
`;

// NOTA TÉCNICA: El backend aún no implementa el query platformStats.
export const GET_PLATFORM_STATS = `
  query GetPlatformStats {
    platformStats {
      activeProjects
      supervisors
      students
      semesters
    }
  }
`;

export const GET_PROFILE = `
  query Me {
    me {
      name
      email
      avatarUrl
    }
  }
`;