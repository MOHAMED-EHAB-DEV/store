import React, { forwardRef, useId, useRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "disabled" | "readOnly" | "required"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode | ((value: string) => React.ReactNode);
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isClearable?: boolean;
  onClear?: () => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  errorMessagePlacement?: "inner" | "outer";
  classNames?: {
    base?: string;
    label?: string;
    inputWrapper?: string;
    innerWrapper?: string;
    input?: string;
    description?: string;
    errorMessage?: string;
  };
}

const Input = forwardRef<HTMLInputElement, InputProps>(
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
      isClearable = false,
      onClear,
      startContent,
      endContent,
      errorMessagePlacement = "outer",
      classNames,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const labelId = `${inputId}-label`;
    const descriptionId = `${inputId}-description`;
    const errorMessageId = `${inputId}-error`;

    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isError = isInvalid;
    const hasHelperText = !!description || (isError && !!errorMessage && errorMessagePlacement === "outer");
    
    // Check if we have value (for clear button visibility)
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : uncontrolledValue;
    const hasValue = !!currentValue || currentValue === 0;

    const handleClear = () => {
      if (isReadOnly || isDisabled) return;
      if (!isControlled) {
        setUncontrolledValue("");
      }
      if (onClear) {
        onClear();
      }
      innerRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValue(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

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

    const handleWrapperClick = () => {
      innerRef.current?.focus();
    };

    // Render inner error message
    const renderInnerError = () => {
      if (!isError || !errorMessage || errorMessagePlacement !== "inner") return null;
      const content = typeof errorMessage === "function" ? errorMessage(String(currentValue || "")) : errorMessage;
      return (
        <div
          id={errorMessageId}
          className={cn("text-xs text-red-500 px-4 pb-2", classNames?.errorMessage)}
        >
          {content}
        </div>
      );
    };

    // Render outer error message or description
    const renderHelperText = () => {
      if (isError && errorMessage && errorMessagePlacement === "outer") {
        const content = typeof errorMessage === "function" ? errorMessage(String(currentValue || "")) : errorMessage;
        return (
          <div
            id={errorMessageId}
            className={cn("text-xs text-red-500 mt-1", classNames?.errorMessage)}
          >
            {content}
          </div>
        );
      }

      if (description) {
        return (
          <div
            id={descriptionId}
            className={cn("text-xs text-muted-foreground mt-1", classNames?.description)}
          >
            {description}
          </div>
        );
      }

      return null;
    };

    return (
      <div
        className={cn(
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
            className={cn(
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
          onClick={handleWrapperClick}
          className={cn(
            "relative flex flex-col w-full rounded-xl border bg-white/5 transition-all duration-200 cursor-text",
            isError
              ? "border-red-500/50 hover:border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
              : "border-white/10 hover:border-white/20 hover:bg-white/10 focus-within:border-purple-500 focus-within:bg-white/5 focus-within:ring-2 focus-within:ring-purple-500/20",
            isReadOnly && "opacity-80",
            classNames?.inputWrapper
          )}
        >
          <div className={cn("relative flex items-center w-full px-4 py-3 h-12", classNames?.innerWrapper)}>
            {startContent && (
              <div className="flex-shrink-0 mr-3 flex items-center justify-center text-muted-foreground group-focus-within:text-white transition-colors">
                {startContent}
              </div>
            )}
            
            <input
              ref={innerRef}
              id={inputId}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isError}
              aria-required={isRequired}
              aria-describedby={getAriaDescribedBy()}
              aria-labelledby={getAriaLabelledBy()}
              value={value}
              defaultValue={defaultValue}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Escape" && isClearable && hasValue && !isReadOnly && !isDisabled) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }
                if (props.onKeyDown) props.onKeyDown(e);
              }}
              className={cn(
                "w-full h-full bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none",
                "file:text-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
                classNames?.input
              )}
              style={style}
              {...props}
            />
            
            {isClearable && hasValue && !isReadOnly && !isDisabled && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Clear input"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="ml-2 flex-shrink-0 p-1 opacity-60 hover:opacity-100 focus:opacity-100 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-opacity"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="16"
                  role="presentation"
                  viewBox="0 0 24 24"
                  width="16"
                  className="text-white"
                >
                  <path
                    d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}

            {endContent && (
              <div className="flex-shrink-0 ml-3 flex items-center justify-center text-muted-foreground group-focus-within:text-white transition-colors">
                {endContent}
              </div>
            )}
          </div>
          {renderInnerError()}
        </div>

        {hasHelperText && renderHelperText()}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
