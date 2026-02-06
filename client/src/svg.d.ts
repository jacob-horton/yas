declare module "*.svg" {
  import { ComponentProps, Component } from "solid-js";
  const src: Component<ComponentProps<"svg">>;
  export default src;
}
