import React, { forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "disabled" | "readOnly" | "required"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode | ((value: string) => React.ReactNode);
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  errorMessagePlacement?: "inner" | "outer";
  classNames?: {
    base?: string;
    label?: string;
    inputWrapper?: string;
    input?: string;
    description?: string;
    errorMessage?: string;
  };
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      style,
      label,
      description,
      errorMessage,
      isInvalid = false,
      isDisabled = false,
      isRequired = false,
      isReadOnly = false,
      errorMessagePlacement = "outer",
      classNames,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `textarea-${generatedId}`;
    const labelId = `${inputId}-label`;
    const descriptionId = `${inputId}-description`;
    const errorMessageId = `${inputId}-error`;

    const isError = isInvalid;
    const hasHelperText = !!description || (isError && !!errorMessage && errorMessagePlacement === "outer");

    const getAriaDescribedBy = () => {
      const ids = [];
      if (ariaDescribedBy) ids.push(ariaDescribedBy);
      if (isError && errorMessage) ids.push(errorMessageId);
      else if (description) ids.push(descriptionId);
      return ids.length > 0 ? ids.join(" ") : undefined;
    };

    const getAriaLabelledBy = () => {
      if (ariaLabelledBy) return ariaLabelledBy;
      if (label) return labelId;
      return undefined;
    };

    // Render inner error message (if placement is inner)
    const renderInnerError = () => {
      if (!isError || !errorMessage || errorMessagePlacement !== "inner") return null;
      const content = typeof errorMessage === "function" ? errorMessage(String(value || defaultValue || "")) : errorMessage;
      return (
        <div
          id={errorMessageId}
          className={twMerge("text-xs text-red-500 px-4 pb-2", classNames?.errorMessage)}
        >
          {content}
        </div>
      );
    };

    // Render outer error message or description
    const renderHelperText = () => {
      if (isError && errorMessage && errorMessagePlacement === "outer") {
        const content = typeof errorMessage === "function" ? errorMessage(String(value || defaultValue || "")) : errorMessage;
        return (
          <div
            id={errorMessageId}
            className={twMerge("text-xs text-red-500 mt-1", classNames?.errorMessage)}
          >
            {content}
          </div>
        );
      }

      if (description) {
        return (
          <div
            id={descriptionId}
            className={twMerge("text-xs text-muted-foreground mt-1", classNames?.description)}
          >
            {description}
          </div>
        );
      }

      return null;
    };

    return (
      <div
        className={twMerge(
          "flex flex-col w-full group",
          isDisabled && "opacity-50 pointer-events-none",
          className,
          classNames?.base
        )}
      >
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className={twMerge(
              "text-sm font-medium mb-1.5",
              isRequired && "after:content-['*'] after:text-red-500 after:ml-0.5",
              isError ? "text-red-500" : "text-white/90 group-focus-within:text-white",
              classNames?.label
            )}
          >
            {label}
          </label>
        )}

        <div
          className={twMerge(
            "relative flex flex-col w-full rounded-xl border bg-white/5 transition-all duration-200",
            isError
              ? "border-red-500/50 hover:border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
              : "border-white/10 hover:border-white/20 hover:bg-white/10 focus-within:border-purple-500 focus-within:bg-white/5 focus-within:ring-2 focus-within:ring-purple-500/20",
            isReadOnly && "opacity-80",
            classNames?.inputWrapper
          )}
        >
          <textarea
            ref={ref}
            id={inputId}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={isRequired}
            aria-invalid={isError}
            aria-required={isRequired}
            aria-describedby={getAriaDescribedBy()}
            aria-labelledby={getAriaLabelledBy()}
            value={value}
            defaultValue={defaultValue}
            className={twMerge(
              "w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none resize-none flex field-sizing-content min-h-16 max-h-[11.5rem] md:max-h-[9.75rem]",
              classNames?.input
            )}
            style={{
              minHeight: props.rows ? `calc(${props.rows}lh + 1.5rem)` : undefined,
              ...style
            }}
            {...props}
          />
          {renderInnerError()}
        </div>

        {hasHelperText && renderHelperText()}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
