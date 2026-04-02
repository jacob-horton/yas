import {
  A,
  type AnchorProps,
  usePreloadRoute,
  useResolvedPath,
} from "@solidjs/router";

// Link that preloads onTouchStart as well as hover to make mobile work too
export function PreloadLink(props: AnchorProps) {
  const preload = usePreloadRoute();
  const resolvedPath = useResolvedPath(() => props.href);

  return (
    <A
      {...props}
      onTouchStart={(e) => {
        const path = resolvedPath();
        // preloadData: true is required to fetch the API, not just the JS chunk
        if (path) preload(path, { preloadData: true });

        // Preserve any existing onTouchStart
        if (typeof props.onTouchStart === "function") props.onTouchStart(e);
      }}
    >
      {props.children}
    </A>
  );
}
