import CircleAlertIcon from 'lucide-solid/icons/circle-alert';
import type { Component } from 'solid-js';

export const Input: Component<{
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}> = (props) => {
  return (
    <div
      class="flex flex-col gap-1 transition"
      classList={{ 'text-red-500': !!props.error }}
    >
      <div
        class="group flex max-w-96 rounded-md border font-medium transition focus-within:border-orange-400"
        classList={{ 'bg-red-100 focus-within:border-red-500': !!props.error }}
      >
        <div
          class="w-2 bg-transparent transition group-focus-within:bg-orange-400"
          classList={{ 'group-focus-within:bg-red-500': !!props.error }}
        />
        <div class="px-3 py-2">
          <p
            class="text-xs text-gray-400 transition"
            classList={{ 'text-red-400': !!props.error }}
          >
            {props.label}
          </p>
          <input
            class="transition outline-none placeholder:text-gray-300"
            classList={{ 'placeholder:text-red-300': !!props.error }}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            type={props.type}
          />
        </div>
      </div>
      {props.error && (
        <span class="flex items-center gap-1 text-sm">
          <CircleAlertIcon size={18} />
          <p>{props.error}</p>
        </span>
      )}
    </div>
  );
};
