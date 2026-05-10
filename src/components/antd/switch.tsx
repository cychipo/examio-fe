import { Switch as AntSwitch } from "antd";
import type { SwitchProps as AntSwitchProps } from "antd";

type SwitchProps = Omit<AntSwitchProps, "onChange"> & {
  onCheckedChange?: (checked: boolean) => void;
  onChange?: AntSwitchProps["onChange"];
};

function Switch({ checked, onCheckedChange, onChange, className, ...props }: SwitchProps) {
  return (
    <AntSwitch
      checked={checked}
      onChange={(value, event) => {
        onChange?.(value, event);
        onCheckedChange?.(value);
      }}
      className={className}
      {...props}
    />
  );
}

export { Switch };
