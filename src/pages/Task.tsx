import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { Tab } from "@leafygreen-ui/tabs";
import { useParams, useLocation } from "react-router-dom";
import { useTaskAnalytics } from "analytics";
import { Banners } from "components/Banners";
import { BreadCrumb } from "components/Breadcrumb";
import BuildBaron from "components/BuildBaronAndAnnotations/BuildBaron";
import { ErrorBoundary } from "components/ErrorBoundary";
import { PageTitle } from "components/PageTitle";
import { TrendChartsPlugin } from "components/PerfPlugin";
import {
  PageWrapper,
  PageContent,
  PageLayout,
  PageSider,
} from "components/styles";
import { StyledTabs } from "components/styles/StyledTabs";
import { TabLabelWithBadge } from "components/TabLabelWithBadge";
import { TaskStatusBadge } from "components/TaskStatusBadge";
import { pollInterval } from "constants/index";
import { paths } from "constants/routes";
import {
  useBannerDispatchContext,
  useBannerStateContext,
} from "context/banners";
import { GetTaskQuery, GetTaskQueryVariables } from "gql/generated/types";
import { GET_TASK } from "gql/queries";
import { withBannersContext } from "hoc/withBannersContext";
import { useTabs, usePageTitle, useNetworkStatus } from "hooks";
import { useBuildBaronVariables } from "hooks/useBuildBaronVariables";
import { useUpdateURLQueryParams } from "hooks/useUpdateURLQueryParams";
import { ActionButtons } from "pages/task/ActionButtons";
import { ExecutionSelect } from "pages/task/executionDropdown/ExecutionSelector";
import { FilesTables } from "pages/task/FilesTables";
import { Logs } from "pages/task/Logs";
import { Metadata } from "pages/task/Metadata";
import { TestsTable } from "pages/task/TestsTable";
import { TaskTab, RequiredQueryParams, TaskStatus } from "types/task";
import { parseQueryString } from "utils";

const tabToIndexMap = {
  [TaskTab.Logs]: 0,
  [TaskTab.Tests]: 1,
  [TaskTab.Files]: 2,
  [TaskTab.Annotations]: 3,
  [TaskTab.TrendCharts]: 4,
};

const TaskCore: React.FC = () => {
  const { id, tab } = useParams<{ id: string; tab: string | null }>();
  const dispatchBanner = useBannerDispatchContext();
  const bannersState = useBannerStateContext();
  const taskAnalytics = useTaskAnalytics();
  const location = useLocation();
  const updateQueryParams = useUpdateURLQueryParams();
  const parsed = parseQueryString(location.search);
  const selectedExecution = Number(parsed[RequiredQueryParams.Execution]);

  // Query task data
  const { data, loading, error, startPolling, stopPolling } = useQuery<
    GetTaskQuery,
    GetTaskQueryVariables
  >(GET_TASK, {
    variables: { taskId: id, execution: selectedExecution },
    pollInterval,
    onError: (err) =>
      dispatchBanner.errorBanner(
        `There was an error loading the task: ${err.message}`
      ),
  });

  useNetworkStatus(startPolling, stopPolling);
  const { task, taskFiles } = data ?? {};
  const {
    canAbort,
    blocked,
    canRestart,
    canSchedule,
    canUnschedule,
    canSetPriority,
    displayName,
    patchNumber,
    priority,
    status,
    version,
    totalTestCount,
    failedTestCount,
    logs: logLinks,
    isPerfPluginEnabled,
    annotation,
    latestExecution,
    patchMetadata,
    canModifyAnnotation,
  } = task ?? {};
  const { fileCount } = taskFiles ?? {};
  const { author: patchAuthor } = patchMetadata ?? {};
  const attributed = annotation?.issues?.length > 0;

  // Set the execution if it isnt provided
  if (Number.isNaN(selectedExecution) && latestExecution !== undefined) {
    updateQueryParams({
      execution: `${latestExecution}`,
    });
  }

  const {
    showBuildBaron,
    buildBaronData,
    buildBaronError,
    buildBaronLoading,
  } = useBuildBaronVariables({
    taskId: id,
    execution: selectedExecution,
    taskStatus: status,
  });

  const failedTask =
    status === TaskStatus.Failed ||
    status === TaskStatus.SetupFailed ||
    status === TaskStatus.SystemFailed ||
    status === TaskStatus.TaskTimedOut ||
    status === TaskStatus.TestTimedOut;

  const showAnnotationsTab =
    failedTask && (showBuildBaron || annotation || canModifyAnnotation);

  usePageTitle(`Task${displayName ? ` - ${displayName}` : ""}`);

  // logic for tabs + updating url when they change
  const [selectedTab, selectTabHandler] = useTabs({
    tabToIndexMap,
    defaultTab: TaskTab.Logs,
    path: `${paths.task}/${id}`,
    query: new URLSearchParams(location.search),
    sendAnalyticsEvent: (newTab: string) =>
      taskAnalytics.sendEvent({ name: "Change Tab", tab: newTab }),
  });

  useEffect(() => {
    // the hierarchy of which tab loads first is:
    // 1. if the URL contains a tab, that trumps everything
    // 2. if the task has at least 1 test, load the tests tab
    // 3. otherwise load the logs tab (this default is set in the useTabs hook)
    if (tab in tabToIndexMap) {
      selectTabHandler(tabToIndexMap[tab]);
    } else if (data && totalTestCount > 0) {
      selectTabHandler(tabToIndexMap[TaskTab.Tests]);
    }
  }, [data, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    stopPolling();
  }

  if (error) {
    return (
      <PageWrapper>
        <Banners
          banners={bannersState}
          removeBanner={dispatchBanner.removeBanner}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Banners
        banners={bannersState}
        removeBanner={dispatchBanner.removeBanner}
      />
      {task && (
        <BreadCrumb
          patchAuthor={patchAuthor}
          patchNumber={patchNumber}
          taskName={displayName}
          versionId={version}
        />
      )}
      <PageTitle
        loading={loading}
        hasData={!!(displayName && status)}
        title={displayName}
        badge={
          <ErrorBoundary>
            <StyledBadgeWrapper>
              <TaskStatusBadge status={status} blocked={blocked} />
              {attributed && (
                <TaskStatusBadge status={TaskStatus.Known} blocked={blocked} />
              )}
            </StyledBadgeWrapper>
          </ErrorBoundary>
        }
        buttons={
          <ActionButtons
            canAbort={canAbort}
            canRestart={canRestart}
            canSchedule={canSchedule}
            canUnschedule={canUnschedule}
            canSetPriority={canSetPriority}
            initialPriority={priority}
          />
        }
      />
      <PageLayout>
        <PageSider>
          {latestExecution > 0 && (
            <ExecutionSelect
              id={id}
              currentExecution={selectedExecution}
              latestExecution={latestExecution}
              updateExecution={(n: number) => {
                taskAnalytics.sendEvent({ name: "Change Execution" });
                updateQueryParams({
                  execution: `${n}`,
                });
              }}
            />
          )}
          <Metadata taskId={id} task={task} loading={loading} error={error} />
        </PageSider>
        <LogWrapper>
          <PageContent>
            <StyledTabs selected={selectedTab} setSelected={selectTabHandler}>
              <Tab name="Logs" data-cy="task-logs-tab">
                <Logs logLinks={logLinks} />
              </Tab>
              <Tab
                name={
                  <span>
                    {failedTestCount ? (
                      <TabLabelWithBadge
                        tabLabel="Tests"
                        badgeVariant="red"
                        badgeText={failedTestCount}
                        dataCyBadge="tests-tab-badge"
                      />
                    ) : (
                      "Tests"
                    )}
                  </span>
                }
                data-cy="task-tests-tab"
              >
                <TestsTable />
              </Tab>
              <Tab
                name={
                  <span>
                    {fileCount !== undefined ? (
                      <TabLabelWithBadge
                        tabLabel="Files"
                        badgeVariant="lightgray"
                        badgeText={fileCount}
                        dataCyBadge="files-tab-badge"
                      />
                    ) : (
                      "Files"
                    )}
                  </span>
                }
                data-cy="task-files-tab"
              >
                <FilesTables />
              </Tab>
              <Tab
                name="Task Annotations"
                data-cy="task-build-baron-tab"
                disabled={!showAnnotationsTab}
              >
                <BuildBaron
                  annotation={annotation}
                  bbData={buildBaronData}
                  error={buildBaronError}
                  taskId={id}
                  execution={selectedExecution}
                  loading={buildBaronLoading}
                  userCanModify={canModifyAnnotation}
                />
              </Tab>
              <Tab
                name="Trend Charts"
                data-cy="trend-charts-tab"
                disabled={!isPerfPluginEnabled}
              >
                <TrendChartsPlugin taskId={id} />
              </Tab>
            </StyledTabs>
          </PageContent>
        </LogWrapper>
      </PageLayout>
    </PageWrapper>
  );
};

export const Task = withBannersContext(TaskCore);

const LogWrapper = styled(PageLayout)`
  width: 100%;
`;

const StyledBadgeWrapper = styled.div`
  > :nth-child(2) {
    margin-left: 10px;
  }
`;
