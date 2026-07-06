import { cn } from "./utils";

type VariantConfig<T> = {
  variants?: {
    [K in keyof T]?: Record<string, string>;
  };
  defaultVariants?: {
    [K in keyof T]?: string;
  };
};

export function cva<T>(base?: string, config?: VariantConfig<T>) {
  return function (props?: T & { className?: string }): string {
    const classes = [base];

    if (config?.variants) {
      for (const key in config.variants) {
        const variantOptions = config.variants[key] || {};
        const propValue = (props as any)?.[key] || (config.defaultVariants as any)?.[key];
        
        if (propValue && variantOptions[propValue]) {
          classes.push(variantOptions[propValue]);
        }
      }
    }

    if (props?.className) {
      classes.push(props.className);
    }

    return cn(...classes);
  };
}
