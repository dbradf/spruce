import { gql } from "@apollo/client";

export const GET_PATCH_TASKS = gql`
  query PatchTasks(
    $patchId: String!
    $sorts: [SortOrder!]
    $page: Int
    $statuses: [String!]
    $baseStatuses: [String!]
    $variant: String
    $taskName: String
    $limit: Int
  ) {
    patchTasks(
      patchId: $patchId
      limit: $limit
      page: $page
      statuses: $statuses
      baseStatuses: $baseStatuses
      sorts: $sorts
      variant: $variant
      taskName: $taskName
    ) {
      count
      tasks {
        id
        status
        displayName
        buildVariant
        blocked
        executionTasksFull {
          id
          execution
          displayName
          status
          buildVariant
          baseStatus
        }
        baseTask {
          status
        }
      }
    }
  }
`;
