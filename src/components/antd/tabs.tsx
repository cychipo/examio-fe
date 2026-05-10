import * as React from "react";
import { Tabs as AntTabs } from "antd";
import type { TabsProps as AntTabsProps } from "antd";
import { cn } from "@/lib/utils";

function collectByType(children: React.ReactNode, target: React.ElementType) {
  const result: React.ReactElement<any>[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const element = child as React.ReactElement<any>;
    if (element.type === target) {
      result.push(element);
      return;
    }
    result.push(...collectByType(element.props.children, target));
  });
  return result;
}

function Tabs({ className, value, defaultValue, onValueChange, children, ...props }: Omit<AntTabsProps, "onChange" | "items"> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void }) {
  const triggers = collectByType(children, TabsTrigger);
  const contents = collectByType(children, TabsContent);
  const items: AntTabsProps["items"] = contents.map((content) => {
    const key = String(content.props.value);
    const trigger = triggers.find((item) => String(item.props.value) === key);
    return {
      key,
      label: <span className={cn("inline-flex items-center justify-center gap-2", trigger?.props.className)}>{trigger?.props.children ?? key}</span>,
      children: <div className={content.props.className}>{content.props.children}</div>,
      disabled: trigger?.props.disabled,
    };
  });

  return (
    <AntTabs
      className={cn("[&_.ant-tabs-tab-btn]:inline-flex [&_.ant-tabs-tab-btn]:items-center", className)}
      activeKey={value}
      defaultActiveKey={defaultValue}
      items={items}
      onChange={onValueChange}
      {...props}
    />
  );
}

function TabsList({ children }: React.ComponentProps<"div">) {
  return <>{children}</>;
}

function TabsTrigger({ children }: React.ComponentProps<"button"> & { value: string }) {
  return <>{children}</>;
}

function TabsContent({ children }: React.ComponentProps<"div"> & { value: string }) {
  return <>{children}</>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
