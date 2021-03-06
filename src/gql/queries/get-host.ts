import { gql } from "@apollo/client";

export const GET_HOST = gql`
  query Host($id: String!) {
    host(hostId: $id) {
      id
      hostUrl
      distroId
      tag
      provider
      startedBy
      user
      status
      runningTask {
        id
        name
      }
      lastCommunicationTime
    }
  }
`;
