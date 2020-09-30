import React from "react";
import BuildBaron from "components/Buildbaron/BuildBaron";
import { customRenderWithRouterMatch as render } from "test_utils/test-utils";

const taskId =
  "spruce_ubuntu1604_e2e_test_e0ece5ad52ad01630bdf29f55b9382a26d6256b3_20_08_26_19_20_41";
const buildBaronQuery = {
  buildBaron: {
    buildBaronConfigured: true,
    searchReturnInfo: {
      issues: [
        {
          key: "EVG-12345",
          fields: {
            summary: "This is a random Jira ticket title 1",
            assigneeDisplayName: null,
            resolutionName: "Declined",
            created: "2020-09-23T15:31:33.000+0000",
            updated: "2020-09-23T15:33:02.000+0000",
            status: {
              id: "5",
              name: "Resolved",
            },
          },
        },
        {
          key: "EVG-12346",
          fields: {
            summary: "This is a random Jira ticket title 2",
            assigneeDisplayName: "John Liu",
            resolutionName: "Declined",
            created: "2020-09-18T16:58:32.000+0000",
            updated: "2020-09-18T19:56:42.000+0000",
            status: {
              id: "6",
              name: "Closed",
            },
          },
        },
        {
          key: "EVG-12347",
          fields: {
            summary: "This is a random Jira ticket title 3",
            assigneeDisplayName: "Backlog - Evergreen Team",
            resolutionName: "Declined",
            created: "2020-09-18T17:04:06.000+0000",
            updated: "2020-09-18T19:56:29.000+0000",
            status: {
              id: "1",
              name: "Open",
            },
          },
        },
      ],
      search:
        '(project in (EVG)) and ( text~"docker\\\\-cleanup" ) order by updatedDate desc',
      source: "JIRA",
      featuresURL: "",
    },
  },
};

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.useRealTimers();
});
test("Renders the BuildBaron", async () => {
  const { queryAllByDataCy, queryByDataCy } = render(
    <BuildBaron data={buildBaronQuery} error={undefined} taskId={taskId} />
  );
  expect(queryAllByDataCy("bb-metadata-wrapper")).toHaveLength(1);
  expect(queryAllByDataCy("bb-metadata-created")).toHaveLength(3);

  expect(queryByDataCy("build-baron-table")).toBeVisible();
  expect(queryByDataCy("file-ticket-button")).toBeVisible();

  expect(queryByDataCy("bb-jira-ticket-row")).toBeNull();
});