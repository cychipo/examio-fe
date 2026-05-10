import * as React from "react";
import { Modal } from "antd";
import { cn } from "@/lib/utils";

type Ctx = { open?: boolean; onOpenChange?: (open: boolean) => void };
type DialogContentProps = React.ComponentProps<"div"> & {
  onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
  onPointerDownOutside?: (event: React.PointerEvent) => void;
  onCloseAutoFocus?: (event: React.FocusEvent) => void;
  showCloseButton?: boolean;
};
const DialogContext = React.createContext<Ctx>({});

function Dialog({ children, open, onOpenChange }: React.PropsWithChildren<Ctx>) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const ctx = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { onClick: () => ctx.onOpenChange?.(true) });
  return <button type="button" onClick={() => ctx.onOpenChange?.(true)}>{children}</button>;
}

function DialogContent({ className, children, onEscapeKeyDown, onPointerDownOutside, onCloseAutoFocus, showCloseButton, ...props }: DialogContentProps) {
  const ctx = React.useContext(DialogContext);
  return <Modal open={ctx.open} onCancel={() => ctx.onOpenChange?.(false)} footer={null} className={className} {...(props as any)}>{children}</Modal>;
}

function DialogClose({ children, asChild, ...props }: React.PropsWithChildren<{ asChild?: boolean } & React.ComponentProps<"button">>) {
  const ctx = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { onClick: () => ctx.onOpenChange?.(false) });
  return <button type="button" onClick={() => ctx.onOpenChange?.(false)} {...props}>{children}</button>;
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function DialogDescription({ className, asChild, children, ...props }: React.ComponentProps<"p"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn((children as React.ReactElement<any>).props.className, "text-sm text-muted-foreground", className),
    });
  }
  return <p className={cn("text-sm text-muted-foreground", className)} {...props}>{children}</p>;
}

export { Dialog, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
