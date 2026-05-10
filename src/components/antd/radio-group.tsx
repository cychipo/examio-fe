import * as React from "react";
import { Radio } from "antd";
import type { RadioChangeEvent, RadioGroupProps as AntRadioGroupProps } from "antd";
import { cn } from "@/lib/utils";

type RadioContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

type RadioGroupProps = Omit<AntRadioGroupProps, "onChange"> & {
  onValueChange?: (value: string) => void;
};

const RadioContext = React.createContext<RadioContextValue>({});

function RadioGroup({ className, value, defaultValue, onValueChange, disabled, children, ...props }: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;

  function handleChange(event: RadioChangeEvent) {
    setInternalValue(event.target.value);
    onValueChange?.(String(event.target.value));
  }

  return (
    <RadioContext.Provider value={{ value: selectedValue as string, onValueChange, disabled }}>
      <Radio.Group
        className={cn("grid gap-3", className)}
        value={selectedValue}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      >
        {children}
      </Radio.Group>
    </RadioContext.Provider>
  );
}

function RadioGroupItem({ className, value, disabled, ...props }: React.ComponentProps<typeof Radio>) {
  const context = React.useContext(RadioContext);
  return <Radio className={className} value={value} disabled={disabled || context.disabled} {...props} />;
}

export { RadioGroup, RadioGroupItem };
