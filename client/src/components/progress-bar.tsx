export const ProgressBar = (props: { percentage: number }) => {
  return (
    <div class="h-4 w-full overflow-clip rounded-sm border border-gray-300 bg-gray-100">
      <div
        class={`h-full bg-violet-400`}
        style={{ width: `${props.percentage}%` }}
      />
    </div>
  );
};
