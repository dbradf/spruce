import React from "react";
import { Table } from "antd";
import { ColumnProps } from "antd/es/table";
import get from "lodash/get";
import { useHistory, useLocation } from "react-router-dom";
import { usePatchAnalytics } from "analytics";
import { TaskResult, PatchTasks } from "gql/generated/types";
import { PatchTasksQueryParams, TableOnChange } from "types/task";
import { stringifyQuery, parseQueryString } from "utils/queryString";
import { toSortString } from "../util";

interface Props {
  data?: PatchTasks;
  columns: Array<ColumnProps<TaskResult>>;
}

export const TasksTable: React.FC<Props> = ({ data, columns }) => {
  const { replace } = useHistory();
  const { search, pathname } = useLocation();

  const patchAnalytics = usePatchAnalytics();
  const tableChangeHandler: TableOnChange<TaskResult> = (...[, , sorter]) => {
    const nextQueryParams = stringifyQuery({
      ...parseQueryString(search),
      sorts: toSortString(sorter),
      [PatchTasksQueryParams.Page]: "0",
    });
    if (nextQueryParams !== search.split("?")[1]) {
      replace(`${pathname}?${nextQueryParams}`);
    }
  };

  return (
    <Table
      data-test-id="tasks-table"
      rowKey={rowKey}
      pagination={false}
      columns={columns}
      dataSource={get(data, "tasks", []) as TaskResult[]}
      onChange={tableChangeHandler}
      childrenColumnName="executionTasksFull"
      expandable={{
        onExpand: (expanded) => {
          patchAnalytics.sendEvent({
            name: "Toggle Display Task Dropdown",
            expanded,
          });
        },
      }}
    />
  );
};

const rowKey = ({ id }: { id: string }): string => id;
