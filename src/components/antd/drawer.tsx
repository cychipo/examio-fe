import * as React from "react";
import { Drawer as AntDrawer } from "antd";
import { cn } from "@/lib/utils";

type DrawerContextValue = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DrawerContext = React.createContext<DrawerContextValue>({});

function Drawer({ open, defaultOpen, onOpenChange, children }: React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const currentOpen = open ?? internalOpen;
  function setOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
  }
  return <DrawerContext.Provider value={{ open: currentOpen, onOpenChange: setOpen }}>{children}</DrawerContext.Provider>;
}

function DrawerTrigger({ children }: React.PropsWithChildren) {
  const context = React.useContext(DrawerContext);
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: (event: any) => { (children as React.ReactElement<any>).props.onClick?.(event); context.onOpenChange?.(true); } });
  }
  return <button type="button" onClick={() => context.onOpenChange?.(true)}>{children}</button>;
}

function DrawerPortal({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DrawerClose({ children }: React.PropsWithChildren) {
  const context = React.useContext(DrawerContext);
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: (event: any) => { (children as React.ReactElement<any>).props.onClick?.(event); context.onOpenChange?.(false); } });
  }
  return <button type="button" onClick={() => context.onOpenChange?.(false)}>{children}</button>;
}

function DrawerOverlay() {
  return null;
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const context = React.useContext(DrawerContext);
  return <AntDrawer open={context.open} onClose={() => context.onOpenChange?.(false)} placement="bottom" className={className} {...(props as any)}>{children}</AntDrawer>;
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("flex flex-col gap-0.5 p-4 md:gap-1.5 md:text-left", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="drawer-title" className={cn("text-foreground font-semibold", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="drawer-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
