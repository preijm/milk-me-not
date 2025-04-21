
import { useCallback } from "react";
import { ToastActionElement, type ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateToastId() {
  return `${count++}`;
}

// In a real application, you'd use a state management library like Zustand or Redux
// For simplicity, we're just using a global variable
const toasts: ToasterToast[] = [];

type Toast = Omit<ToasterToast, "id">;

export function toast(props: Toast) {
  const id = generateToastId();

  const newToast: ToasterToast = {
    ...props,
    id,
  };

  toasts.push(newToast);
  
  console.log("Toast created:", newToast);
  
  return id;
}

export function useToast() {
  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      const index = toasts.findIndex(t => t.id === toastId);
      if (index !== -1) {
        toasts.splice(index, 1);
      }
    }
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}

