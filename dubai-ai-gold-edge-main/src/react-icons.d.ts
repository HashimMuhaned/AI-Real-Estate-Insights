// src/react-icons.d.ts
import { ComponentType, SVGProps } from "react";

declare module "react-icons/*" {
  export type IconType = ComponentType<SVGProps<SVGSVGElement>>;
}
