"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  action?: React.ReactNode
} & ExternalToast

function toast({ title, description, variant, action, ...props }: ToastProps) {
  const options: ExternalToast = {
    description,
    action: action as any,
    ...props,
  }

  if (variant === "destructive") {
    return sonnerToast.error(title, options)
  }

  return sonnerToast(title, options)
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  }
}

export { useToast, toast }
