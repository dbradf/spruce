import React from "react";
import styled from "@emotion/styled";
import { uiColors } from "@leafygreen-ui/palette";
import { H2 } from "@leafygreen-ui/typography";
import { Modal as AntdModal } from "antd";
import { HR } from "components/styles/Layout";
import { hexToRGBA } from "utils/color";

interface ModalProps {
  footer: JSX.Element[] | JSX.Element;
  title: string | JSX.Element;
  "data-cy": string;
  visible: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onOk?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  footer,
  title,
  onCancel,
  visible,
  children,
  onOk,
  "data-cy": dataCy,
}) => (
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div onClick={(e) => e.stopPropagation()}>
    <StyledModal
      maskStyle={{
        backgroundColor,
      }}
      onOk={onOk}
      centered
      footer={footer}
      visible={visible}
      onCancel={onCancel}
      width="50%"
      wrapProps={{
        "data-cy": dataCy,
      }}
    >
      <H2 data-cy="modal-title">{title}</H2>
      <StyledHR />
      {children}
    </StyledModal>
  </div>
);

const backgroundColor = hexToRGBA(uiColors.black, 0.9);

const StyledModal = styled(AntdModal)`
  .ant-modal-body {
    padding-bottom: 89px;
  }
`;

const StyledHR = styled(HR)`
  margin-top: 15px;
`;
