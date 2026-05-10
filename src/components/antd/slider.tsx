import { Slider as AntSlider } from "antd";
import type { SliderSingleProps } from "antd";

type SliderProps = Omit<SliderSingleProps, "value" | "defaultValue" | "onChange"> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onChange?: (value: number) => void;
};

function Slider({ className, value, defaultValue, onValueChange, onChange, ...props }: SliderProps) {
  const finalValue = Array.isArray(value) ? value[0] : value;
  const finalDefault = Array.isArray(defaultValue) ? defaultValue[0] : defaultValue;
  return (
    <AntSlider
      value={finalValue}
      defaultValue={finalDefault}
      onChange={(nextValue) => {
        onChange?.(nextValue);
        onValueChange?.([nextValue]);
      }}
      className={className}
      {...props}
    />
  );
}

export { Slider };
