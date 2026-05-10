import * as React from "react";
import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className, ...props }, ref) => (
  <Input.TextArea ref={ref as any} className={className} {...props} />
));
Textarea.displayName = "Textarea";
export { Textarea };
