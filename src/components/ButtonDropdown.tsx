import React from "react";
import styled from "@emotion/styled";
import Card from "@leafygreen-ui/card";
import Icon from "@leafygreen-ui/icon";
import { uiColors } from "@leafygreen-ui/palette";
import { Button } from "components/Button";

const { gray } = uiColors;

interface Props {
  disabled?: boolean;
  setIsVisibleDropdown?: (v: boolean) => void;
  loading?: boolean;
  isVisibleDropdown?: boolean;
  dropdownItems: JSX.Element[];
  dataCyBtn?: string;
  dataCyDropdown?: string;
}

export const ButtonDropdown: React.FC<Props> = ({
  disabled = false,
  loading = false,
  setIsVisibleDropdown = () => undefined,
  isVisibleDropdown = true,
  dropdownItems,
  dataCyBtn = "ellipsis-btn",
  dataCyDropdown = "card-dropdown",
}: Props) => {
  const toggleDropdown = () => {
    setIsVisibleDropdown(!isVisibleDropdown);
  };
  return (
    <Container>
      <Button
        size="small"
        data-cy={dataCyBtn}
        disabled={disabled}
        loading={loading}
        onClick={toggleDropdown}
        glyph={<Icon glyph="Ellipsis" />}
      />
      {isVisibleDropdown && (
        <Dropdown data-cy={dataCyDropdown}>{dropdownItems}</Dropdown>
      )}
    </Container>
  );
};
interface CardItemProps {
  disabled: boolean;
}
export const DropdownItem = styled.div`
  > small:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  ${({ disabled }: CardItemProps) => disabled && "pointer-events: none;"}
  > small {
    ${({ disabled }: CardItemProps) => disabled && `color: ${gray.base};`}
  }
`;

const Dropdown = styled(Card)`
  position: absolute;
  right: 0px;
  z-index: 1;
  margin-top: 2px;
  padding: 8px;
  width: max-content;
`;

const Container = styled.div`
  position: relative;
`;
