import * as React from "react";
import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps } from "antd";

const Input = React.forwardRef<HTMLInputElement, AntInputProps>(({ className, ...props }, ref) => (
  <AntInput ref={ref as any} className={className} {...props} />
));
Input.displayName = "Input";
export { Input };
