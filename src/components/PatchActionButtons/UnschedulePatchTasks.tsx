import React, { forwardRef, useState } from "react";
import { useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import Checkbox from "@leafygreen-ui/checkbox";
import { Disclaimer, Body } from "@leafygreen-ui/typography";
import { Popconfirm } from "antd";
import { usePatchAnalytics } from "analytics";
import { DropdownItem } from "components/ButtonDropdown";
import { useBannerDispatchContext } from "context/banners";
import {
  UnschedulePatchTasksMutation,
  UnschedulePatchTasksMutationVariables,
} from "gql/generated/types";
import { UNSCHEDULE_PATCH_TASKS } from "gql/mutations";

interface UnscheduleProps {
  patchId: string;
  hideMenu: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  refetchQueries: string[];
  setParentLoading?: (loading: boolean) => void; // used to toggle loading state of parent
  disabled: boolean;
}
export const UnschedulePatchTasks = forwardRef<HTMLDivElement, UnscheduleProps>(
  (
    {
      patchId,
      hideMenu,
      refetchQueries,
      disabled,
      setParentLoading = () => undefined,
    },
    ref
  ) => {
    const { successBanner, errorBanner } = useBannerDispatchContext();
    const [abort, setAbort] = useState(false);
    const [
      unschedulePatchTasks,
      { loading: loadingUnschedulePatchTasks },
    ] = useMutation<
      UnschedulePatchTasksMutation,
      UnschedulePatchTasksMutationVariables
    >(UNSCHEDULE_PATCH_TASKS, {
      onCompleted: () => {
        successBanner(
          `All tasks were unscheduled ${
            abort ? "and tasks that already started were aborted" : ""
          }`
        );
        setAbort(false);
        hideMenu();
        setParentLoading(false);
      },
      onError: (err) => {
        errorBanner(`Error unscheduling tasks: ${err.message}`);
        hideMenu();
        setParentLoading(false);
      },
      refetchQueries,
    });

    const patchAnalytics = usePatchAnalytics();

    return (
      <Popconfirm
        icon={null}
        placement="left"
        title={
          <>
            <StyledBody>Unschedule all tasks?</StyledBody>
            <Checkbox
              data-cy="abort-checkbox"
              label="Abort tasks that have already started"
              onChange={() => setAbort(!abort)}
              checked={abort}
              bold={false}
            />
          </>
        }
        onConfirm={() => {
          setParentLoading(true);
          unschedulePatchTasks({ variables: { patchId, abort } });
          patchAnalytics.sendEvent({ name: "Unschedule", abort });
        }}
        onCancel={hideMenu}
        okText="Yes"
        cancelText="Cancel"
      >
        <DropdownItem
          data-cy="unschedule-patch"
          ref={ref}
          disabled={loadingUnschedulePatchTasks || disabled}
        >
          <Disclaimer>Unschedule all tasks</Disclaimer>
        </DropdownItem>
      </Popconfirm>
    );
  }
);

export const StyledBody = styled(Body)`
  padding-bottom: 8px;
  padding-right: 8px;
`;
