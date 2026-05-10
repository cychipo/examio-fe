import * as React from "react";
import { message } from "antd";
import type { MessageType } from "antd/es/message/interface";

type ToastVariant = "default" | "destructive" | "warning";
type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
};

type ToastFn = {
  (title: React.ReactNode, options?: Omit<ToastOptions, "title">): MessageType;
  success: (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => MessageType;
  error: (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => MessageType;
  info: (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => MessageType;
  warning: (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => MessageType;
};

type LegacyToastFn = ToastFn & ((options: ToastOptions) => MessageType);

function ToastProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function renderContent(title: React.ReactNode, options?: Omit<ToastOptions, "title">) {
  if (!options?.description) return title;
  return <span>{title ? <strong>{title}</strong> : null}{title ? " " : null}{options.description}</span>;
}

const toast = ((title: React.ReactNode, options?: Omit<ToastOptions, "title">) => {
  const content = renderContent(title, options);
  if (options?.variant === "destructive") return message.error(content);
  if (options?.variant === "warning") return message.warning(content);
  return message.info(content);
}) as ToastFn;

toast.success = (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => message.success(renderContent(content, options));
toast.error = (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => message.error(renderContent(content, options));
toast.info = (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => message.info(renderContent(content, options));
toast.warning = (content: React.ReactNode, options?: Omit<ToastOptions, "title">) => message.warning(renderContent(content, options));

const legacyToast = ((options: ToastOptions) => toast(options.title, { description: options.description, variant: options.variant })) as LegacyToastFn;
legacyToast.success = toast.success;
legacyToast.error = toast.error;
legacyToast.info = toast.info;
legacyToast.warning = toast.warning;

const toastHookValue = { toast: legacyToast };

function useToast(): { toast: LegacyToastFn } {
  return toastHookValue;
}

export { ToastProvider, toast, useToast };
