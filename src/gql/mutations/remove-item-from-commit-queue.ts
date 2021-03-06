import { gql } from "@apollo/client";

export const REMOVE_ITEM_FROM_COMMIT_QUEUE = gql`
  mutation RemoveItemFromCommitQueue($commitQueueId: String!, $issue: String!) {
    removeItemFromCommitQueue(commitQueueId: $commitQueueId, issue: $issue)
  }
`;
