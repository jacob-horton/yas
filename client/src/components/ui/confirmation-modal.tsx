import { type Component, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useConfirmation } from "../../context/confirmation-context";
import { Button } from "./button";

type UIProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmationModalUI: Component<UIProps> = (props) => {
  const { state } = useConfirmation();

  return (
    <Show when={state.options()}>
      {(opts) => (
        <Portal>
          <div
            data-state={state.isOpen() ? "open" : "closed"}
            class="group pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <button
              type="button"
              onClick={props.onCancel}
              class="pointer-events-auto absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out group-data-[state=closed]:pointer-events-none group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100"
            />

            <div class="pointer-events-auto relative z-10 w-full max-w-[450px] transform rounded-md bg-white p-6 shadow-xl transition-all duration-300 ease-out group-data-[state=closed]:pointer-events-none group-data-[state=closed]:scale-95 group-data-[state=open]:scale-100 group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100">
              <h3 class="font-semibold text-gray-800 text-lg leading-6">
                {opts().title}
              </h3>

              <div class="mt-2">
                <p class="text-gray-500 text-sm">{opts().description}</p>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={props.onCancel}>
                  {opts().cancelText ?? "Cancel"}
                </Button>

                <Button
                  variant="secondary"
                  danger={opts().danger}
                  onClick={props.onConfirm}
                >
                  {opts().confirmText ?? "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Show>
  );
};
