import {
  type CreateToasterReturn,
  createToaster,
  Toaster,
} from "@ark-ui/solid";
import { createContext, type ParentComponent, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { Toast } from "@/components/ui/toast";

const ToastContext = createContext<CreateToasterReturn>();

export const ToastProvider: ParentComponent = (props) => {
  const toaster = createToaster({
    placement: "bottom-end",
    overlap: true,
    gap: 12,
  });

  return (
    <ToastContext.Provider value={toaster}>
      {props.children}
      <Portal>
        <Toaster toaster={toaster}>
          {(toast) => <Toast toast={toast()} />}
        </Toaster>
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return ctx;
};
