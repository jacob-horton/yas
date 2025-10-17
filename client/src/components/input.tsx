import type { Component } from 'solid-js';

export const Input: Component<{
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}> = (props) => {
  return (
    <div class="group flex max-w-96 rounded-md border font-medium transition focus-within:border-orange-400">
      <div class="w-2 bg-transparent transition group-focus-within:bg-orange-400" />
      <span class="px-3 py-2">
        <p class="text-xs text-gray-400">{props.label}</p>
        <input
          class="outline-none placeholder:text-gray-300"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          type={props.type}
        />
      </span>
    </div>
  );
};
