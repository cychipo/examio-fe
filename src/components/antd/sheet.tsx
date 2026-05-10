import * as React from "react";
import { Drawer } from "antd";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type SheetProps = React.PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

const SheetContext = React.createContext<SheetContextValue>({});

function Sheet({ open, defaultOpen, onOpenChange, children }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const currentOpen = open ?? internalOpen;
  function setOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
  }
  return <SheetContext.Provider value={{ open: currentOpen, onOpenChange: setOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const context = React.useContext(SheetContext);
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: (event: any) => { (children as React.ReactElement<any>).props.onClick?.(event); context.onOpenChange?.(true); } });
  }
  return <button type="button" onClick={() => context.onOpenChange?.(true)}>{children}</button>;
}

function SheetClose({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const context = React.useContext(SheetContext);
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: (event: any) => { (children as React.ReactElement<any>).props.onClick?.(event); context.onOpenChange?.(false); } });
  }
  return <button type="button" onClick={() => context.onOpenChange?.(false)}>{children}</button>;
}

function SheetPortal({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function SheetOverlay() {
  return null;
}

function SheetContent({ side = "right", className, children, ...props }: React.ComponentProps<"div"> & { side?: "top" | "right" | "bottom" | "left" }) {
  const context = React.useContext(SheetContext);
  const placement = side === "top" || side === "bottom" || side === "left" ? side : "right";
  return (
    <Drawer open={context.open} onClose={() => context.onOpenChange?.(false)} placement={placement} className={className} closable={false} {...(props as any)}>
      <button type="button" className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" onClick={() => context.onOpenChange?.(false)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </Drawer>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
