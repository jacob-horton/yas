export const ProgressBar = (props: { percentage: number }) => {
  return (
    <div class="h-5 w-full overflow-clip rounded-sm border">
      <div
        class={`h-full bg-violet-300`}
        style={{ width: `${props.percentage}%` }}
      />
    </div>
  );
};
