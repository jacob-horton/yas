import { type Accessor, createEffect, createSignal } from "solid-js";

export function useSessionStorage<T extends string = string>(
  key: Accessor<string>,
  fallback?: T,
) {
  const [signal, setSignal] = createSignal<T | null>(null);

  createEffect(() => {
    const currentKey = key();
    setSignal(
      () =>
        (window.sessionStorage.getItem(currentKey) as T | null) ??
        fallback ??
        null,
    );
  });

  const setValue = (value: T | null) => {
    const currentKey = key();
    if (value === null) {
      window.sessionStorage.removeItem(currentKey);
    } else {
      window.sessionStorage.setItem(currentKey, value);
    }

    setSignal(() => value);
  };

  return [signal, setValue] as const;
}
