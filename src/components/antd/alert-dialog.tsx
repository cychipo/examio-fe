import * as React from "react";
import { Modal } from "antd";
import { cn } from "@/lib/utils";

type Ctx = { open?: boolean; onOpenChange?: (open: boolean) => void };
type AlertDialogContentProps = React.ComponentProps<"div"> & {
  onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
  onPointerDownOutside?: (event: React.PointerEvent) => void;
};
const AlertDialogContext = React.createContext<Ctx>({});

function AlertDialog({ children, open, onOpenChange }: React.PropsWithChildren<Ctx>) {
  return <AlertDialogContext.Provider value={{ open, onOpenChange }}>{children}</AlertDialogContext.Provider>;
}

function AlertDialogTrigger({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const ctx = React.useContext(AlertDialogContext);
  if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { onClick: () => ctx.onOpenChange?.(true) });
  return <button type="button" onClick={() => ctx.onOpenChange?.(true)}>{children}</button>;
}

function AlertDialogContent({ className, children, onEscapeKeyDown, onPointerDownOutside, ...props }: AlertDialogContentProps) {
  const ctx = React.useContext(AlertDialogContext);
  return <Modal open={ctx.open} onCancel={() => ctx.onOpenChange?.(false)} footer={null} className={className} {...(props as any)}>{children}</Modal>;
}

function AlertDialogAction({ className, children, ...props }: any) {
  const ctx = React.useContext(AlertDialogContext);
  return <button className={cn("ant-btn ant-btn-primary", className)} onClick={(event) => { props.onClick?.(event); ctx.onOpenChange?.(false); }} {...props}>{children}</button>;
}

function AlertDialogCancel({ className, children, ...props }: any) {
  const ctx = React.useContext(AlertDialogContext);
  return <button className={cn("ant-btn", className)} onClick={() => ctx.onOpenChange?.(false)} {...props}>{children}</button>;
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function AlertDialogDescription({ className, asChild, children, ...props }: React.ComponentProps<"p"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn((children as React.ReactElement<any>).props.className, "text-sm text-muted-foreground", className),
    });
  }
  return <p className={cn("text-sm text-muted-foreground", className)} {...props}>{children}</p>;
}

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription };
