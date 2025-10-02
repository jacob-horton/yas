export const ProgressBar = (props: { percentage: number }) => {
  return (
    <div class="w-full h-4 bg-gray-100 border border-gray-300 rounded-sm overflow-clip">
      <div
        class={`bg-violet-400 h-full`}
        style={{ width: `${props.percentage}%` }}
      />
    </div>
  );
};
