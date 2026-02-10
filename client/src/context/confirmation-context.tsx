import type { JSX } from "solid-js";
import {
  type Accessor,
  createContext,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { ConfirmationModalUI } from "@/components/ui/confirmation-modal";

export type ConfirmationOptions = {
  title: string;
  description: JSX.Element;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmationContextType = {
  showConfirm: (options: ConfirmationOptions) => Promise<boolean>;
  closeConfirm: () => void;
  state: {
    isOpen: Accessor<boolean>;
    options: Accessor<ConfirmationOptions | null>;
  };
};

const ConfirmationContext = createContext<ConfirmationContextType>();

export const ConfirmationProvider: ParentComponent = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [options, setOptions] = createSignal<ConfirmationOptions | null>(null);

  let resolveRef: ((value: boolean) => void) | null = null;

  const showConfirm = (opts: ConfirmationOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef = resolve;
    });
  };

  const closeConfirm = () => {
    setIsOpen(false);
  };

  const handleResolve = (result: boolean) => {
    closeConfirm();

    if (resolveRef) {
      resolveRef(result);
      resolveRef = null;
    }
  };

  const internalContext: ConfirmationContextType = {
    showConfirm,
    closeConfirm,
    state: { isOpen, options },
  };

  return (
    <ConfirmationContext.Provider value={internalContext}>
      {props.children}
      <ConfirmationModalUI
        onConfirm={() => handleResolve(true)}
        onCancel={() => handleResolve(false)}
      />
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }

  return ctx;
};
