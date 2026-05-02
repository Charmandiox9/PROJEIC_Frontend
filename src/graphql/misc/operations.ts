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
      userId
      email
      name
      avatarUrl
      isAdmin
    }
  }
`;

export const GET_PROJECT_BY_ID = `
  query FindOne($id: String!) {
    findOne(id: $id) {
      id
      name
      description
      color
      status
      methodology
      isPublic
      createdAt
      updatedAt
      isArchived
      isInstitutional
      mode
      myRole
      documents {
        id
        name
        r2Key
        size
        createdAt
        uploadedBy {
          id
          name
        }
      }
      repositories {
        id
        name
        owner
        repoName
      }
      subject {        
        id
        name
        code
        period
        professors {
          id
          name
        }
      }
      members {
        id
        role
        status
        user {
          id
          name
          avatarUrl
        }
      }
      wallet {
        id
        balance
        currency
        transactions {
          id
          amount
          type
          description
          createdAt
          executorId
        }
        costs {
          id
          name
          amount
          cycle
          isActive
        }
      }
    }
  }
`;

export const GET_PUBLIC_PROJECTS = `
  query GetPublicProjects($skip: Int, $take: Int) {
    findAll(filter: { skip: $skip, take: $take, isPublic: true }, includeMembers: true) {
      total
      items {
        id
        name
        description
        color
        status
        methodology
        isPublic
        isInstitutional
        mode
        subject {
          id
          name
          period
          professors {
            id
            name
          }
        }
        members {
          id
          role
          status
          user {
            id
            name
            avatarUrl
          }
        }
      }
    }
  }
`;

export const UPDATE_PROJECT = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      description
      isInstitutional
      subjectId
      mode
    }
  }
`;

export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      mode
    }
  }
`;

export const ADD_PROJECT_MEMBER = `
  mutation AddProjectMember($input: AddProjectMemberInput!) {
    addProjectMember(input: $input) {
      id
      role
      status
    }
  }
`;

export const GET_MY_PROJECTS = `
  query MyProjects($skip: Int, $take: Int) {
    myProjects(filter: { skip: $skip, take: $take }, includeMembers: true) {
      total
      items {
        id
        name
        description
        color
        status
        methodology
        isPublic
        isInstitutional
        mode
        myRole
        repositories {
          id
          name
          owner
          repoName
        }
        subject {
          id
          name
          period
          professors {
            id
            name
          }
        }
        members {
          id
          role
          status
          user {
            id
            name
            avatarUrl
          }
        }
      }
    }
  }
`;

export const UPDATE_PROJECT_MEMBER_ROLE = `
  mutation UpdateProjectMemberRole($input: UpdateProjectMemberInput!) {
    updateProjectMemberRole(input: $input) {
      id
      role
    }
  }
`;

export const REMOVE_PROJECT_MEMBER = `
  mutation RemoveProjectMember($memberId: ID!) {
    removeProjectMember(memberId: $memberId)
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;

export const GET_MY_NOTIFICATIONS = `
  query MyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      id
      type
      message
      isRead
      createdAt
      entityId
    }
  }
`;

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_READ = `
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const RESPOND_TO_INVITATION = `
  mutation RespondToInvitation($projectId: ID!, $accept: Boolean!) {
    respondToInvitation(projectId: $projectId, accept: $accept) {
      id
      role
    }
  }
`;

export const GET_SUBJECTS = ` 
  query Subjects {
    subjects {
      id
      name
      code
      period
      professors {
        id
        name
        avatarUrl
      }
    }
  }
`;

export const GET_PROJECT_METRICS = `
  query GetProjectMetrics($projectId: String!) {
    projectMetrics(projectId: $projectId) {
      totalTasks
      completedTasks
      overdueTasksCount
      inReviewTasks
      tasksByColumn {
        boardId
        name
        count
        color
      }
      overdueTasksList {
        id
        title
        dueDate
        status
      }
      workload {
        memberName
        todo
        inProgress
        inReview
        done
      }
      activityLast7Days
      activityTrend {
        date
        count
      }
      burndownData {
        date
        totalTasks
        completedTasks
        todoTasks
        inProgressTasks
      }
      projectRisk {
        level
        score
        message
        timeElapsedPercentage
        workCompletedPercentage
      }
      dailyCompletions {
        date
        count
      }
        currentBalance
      totalSpent
      financialTrend {
        date
        balance
        spent
      }
      expensesByType {
        type
        name
        amount
        color
      }
    }
  }
`;

export const GET_DASHBOARD_ACTIVITY = `
  query GetDashboardActivity {
    myWeeklyActivityPoints
    myRecentFeed {
      id
      action
      entity
      createdAt
      meta
      user {
        name
        avatarUrl
      }
      project {
        name
      }
    }
  }
`;

export const GET_GITHUB_DATA = `
  query GetGithubData($token: String!, $owner: String!, $repo: String!, $branch: String!) {
    getGithubCommits(token: $token, owner: $owner, name: $repo, branch: $branch) {
      totalCommits
      commits {
        oid
        message
        additions
        deletions
        committedDate
        author { name user { login avatarUrl } }
      }
    }
    getWorkflowRuns(token: $token, owner: $owner, repo: $repo) {
      id
      status
      conclusion
      display_title
      created_at
      updated_at
      html_url
    }
    getArtifacts(token: $token, owner: $owner, repo: $repo) {
      id
      name
      size_in_bytes
      expired
      created_at
    }
    getPullRequests(token: $token, owner: $owner, repo: $repo) {
      id
      title
      state
      html_url
      created_at
      user_login
      user_avatar
    }
    getDeployments(token: $token, owner: $owner, repo: $repo) {
      id
      environment
      ref
      created_at
      creator_login
    }
    getSecurityAlerts(token: $token, owner: $owner, repo: $repo) {
      number
      state
      severity
      package_name
      created_at
      html_url
    }
  }
`;

export const DISPATCH_WORKFLOW = `
  mutation DispatchWorkflow($token: String!, $owner: String!, $repo: String!, $workflowId: String!, $ref: String!) {
    dispatchWorkflow(token: $token, owner: $owner, repo: $repo, workflowId: $workflowId, ref: $ref) {
      success
      message
    }
  }
`;

export const GET_FULL_PROJECT_REPORT = `
  query GetFullProjectReport($id: String!, $projectId: String!) {
    findOne(id: $id) {
      id
      name
      description
      mode
      methodology
      subject {
        name
        period
        professors {
          id
          name
        }
      }
      createdAt
      members {
        role
        user {
          name
        }
      }
    }
    projectMetrics(projectId: $projectId) {
      totalTasks
      completedTasks
      overdueTasksCount
      inReviewTasks
      projectRisk {
        level
        message
        timeElapsedPercentage
        workCompletedPercentage
      }
      tasksByColumn {
        name
        count
      }
      activityLast7Days
      burndownData {
        date
        totalTasks
        completedTasks
      }
    }
    sprintsByProject(projectId: $projectId) {
      id
      name
      status
      startDate
      endDate
    }
  }
`;

export const GET_DOCUMENT_UPLOAD_URL = `
  mutation GetDocumentUploadUrl($projectId: String!, $fileName: String!, $fileType: String!) {
    getDocumentUploadUrl(projectId: $projectId, fileName: $fileName, fileType: $fileType) {
      uploadUrl
      r2Key
    }
  }
`;

export const SAVE_DOCUMENT_RECORD = `
  mutation SaveDocumentRecord($input: SaveDocumentInput!) {
    saveDocumentRecord(input: $input) {
      id
      name
      r2Key
      fileType
      size
      createdAt
      uploadedBy {
        id
        name
      }
    }
  }
`;

export const GET_DOCUMENT_DOWNLOAD_URL = `
  query GetDocumentDownloadUrl($r2Key: String!) {
    getDocumentDownloadUrl(r2Key: $r2Key)
  }
`;

export const FUND_PROJECT = `
  mutation FundProject($input: FundProjectInput!) {
    fundProject(input: $input) {
      id
      balance
      currency
      transactions {
        id
        amount
        type
        description
        createdAt
      }
    }
  }
`;

export const PAY_MEMBER = `
  mutation PayMember($input: PayMemberInput!) {
    payMember(input: $input) {
      id
      balance
      currency
      transactions {
        id
        amount
        type
        description
        createdAt
      }
    }
  }
`;

export const GET_MY_PROJECT_EARNINGS = `
  query GetMyProjectEarnings($projectId: String!) {
    getMyProjectEarnings(projectId: $projectId)
  }
`;

export const SUBSCRIBE_CATALOG_ITEM = `
  mutation SubscribeCatalogItem($input: SubscribeCatalogInput!) {
    subscribeCatalog(input: $input) {
      id
      balance
      currency
      transactions {
        id
        amount
        type
        description
        createdAt
      }
    }
  }
`;

export const APPLY_PENALTY = `
  mutation ApplyPenalty($input: ApplyPenaltyInput!) {
    applyPenalty(input: $input) { id }
  }
`;

export const CANCEL_SUBSCRIPTION = `
  mutation CancelSubscription($input: CancelSubscriptionInput!) {
    cancelSubscription(input: $input)
  }
`;
