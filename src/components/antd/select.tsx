import * as React from "react";
import { Select as AntSelect } from "antd";
import type { SelectProps as AntSelectProps } from "antd";
import { cn } from "@/lib/utils";

type SelectItemData = { value: string; label: React.ReactNode; disabled?: boolean; className?: string };
type SelectProps = Omit<AntSelectProps, "onChange" | "options"> & {
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
};

function collectItems(children: React.ReactNode): SelectItemData[] {
  const items: SelectItemData[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const element = child as React.ReactElement<any>;
    if (element.type === SelectItem) {
      items.push({
        value: String(element.props.value),
        label: <span className={cn("inline-flex items-center gap-2", element.props.className)}>{element.props.children}</span>,
        disabled: element.props.disabled,
        className: element.props.className,
      });
      return;
    }
    items.push(...collectItems(element.props.children));
  });
  return items;
}

function Select({ value, defaultValue, onValueChange, onOpenChange, children, className, placeholder, ...props }: SelectProps) {
  const items = collectItems(children);
  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === SelectTrigger,
  ) as React.ReactElement<any> | undefined;
  const valueSlot = collectFirstByType(trigger?.props.children, SelectValue) ?? collectFirstByType(children, SelectValue);

  return (
    <AntSelect
      value={value}
      defaultValue={defaultValue}
      options={items.map((item) => ({ value: item.value, label: item.label, disabled: item.disabled }))}
      onChange={(nextValue) => onValueChange?.(String(nextValue))}
      onOpenChange={onOpenChange}
      className={cn("min-w-0", trigger?.props.className, className)}
      placeholder={placeholder ?? valueSlot?.props.placeholder}
      labelRender={valueSlot?.props.children ? () => valueSlot.props.children : undefined}
      {...props}
    />
  );
}

function collectFirstByType(children: React.ReactNode, target: React.ElementType): React.ReactElement<any> | undefined {
  let result: React.ReactElement<any> | undefined;
  React.Children.forEach(children, (child) => {
    if (result || !React.isValidElement(child)) return;
    const element = child as React.ReactElement<any>;
    if (element.type === target) {
      result = element;
      return;
    }
    result = collectFirstByType(element.props.children, target);
  });
  return result;
}

function SelectGroup({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function SelectValue({ placeholder, className, children }: { placeholder?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return <span className={className}>{children ?? placeholder}</span>;
}

function SelectTrigger({ className, children }: React.ComponentProps<"button"> & { size?: "sm" | "default"; asChild?: boolean }) {
  return <span className={className}>{children}</span>;
}

function SelectContent({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return <>{children}</>;
}

function SelectLabel({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return <>{children}</>;
}

function SelectItem({ children }: React.PropsWithChildren<{ value: string; disabled?: boolean; className?: string }>) {
  return <>{children}</>;
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("bg-border my-1 h-px", className)} {...props} />;
}

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
