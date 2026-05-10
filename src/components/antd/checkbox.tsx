import { Checkbox as AntCheckbox } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

type CheckboxProps = Omit<React.ComponentProps<typeof AntCheckbox>, "onChange"> & {
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: CheckboxChangeEvent) => void;
};

function Checkbox({ checked, onCheckedChange, onChange, className, ...props }: CheckboxProps) {
  return (
    <AntCheckbox
      checked={checked}
      onChange={(event) => {
        onChange?.(event);
        onCheckedChange?.(event.target.checked);
      }}
      className={className}
      {...props}
    />
  );
}

export { Checkbox };
