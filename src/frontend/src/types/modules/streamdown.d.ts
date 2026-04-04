import "streamdown";

declare module "streamdown" {
  interface Components {
    citation?: React.ComponentType<unknown>;
    "scoped-citation"?: React.ComponentType<unknown>;
  }
}
