"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type HTMLAttributes
} from "react";
import { createPortal } from "react-dom";
import { useFloating } from "@/hooks/use-floating";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";

const flattenChildren = (children: React.ReactNode): React.ReactElement<any>[] => {
  const result: React.ReactElement<any>[] = [];
  const traverse = (child: React.ReactNode) => {
    if (Array.isArray(child)) {
      child.forEach(traverse);
    } else if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        const childProps = child.props as HTMLAttributes<HTMLDivElement>;
        const {children} = childProps;
        traverse(children);
      } else {
        result.push(child);
      }
    }
  };
  traverse(children);
  return result;
};

const sanitizeKey = (key: React.Key | null) => {
  if (typeof key !== "string") return String(key);
  let sanitized = key;
  if (sanitized.startsWith(".")) {
    const dollarIndex = sanitized.indexOf("$");
    if (dollarIndex !== -1) {
      sanitized = sanitized.slice(dollarIndex + 1);
    }
  }
  return sanitized.replace(/=2/g, ":").replace(/=0/g, "=");
};

type SelectContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value: Set<string> | "all";
  onValueChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  focusedIndex: number;
  selectionMode: "single" | "multiple";
};

const SelectContext = createContext<SelectContextType | null>(null);

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: React.ReactNode;
  children?: React.ReactNode;
  classNames?: {
    base?: string;
    label?: string;
    trigger?: string;
    innerWrapper?: string;
    value?: string;
    selectorIcon?: string;
    listboxWrapper?: string;
    list?: string;
    popover?: string;
    popoverContent?: string;
  };
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isRequired?: boolean;
  selectedKeys?: "all" | Iterable<string>;
  onChange?: (e: { target: { value: string } }) => void;
  onSelectionChange?: (keys: Set<string>) => void;
  placeholder?: string;
  labelPlacement?: "inside" | "outside";
  variant?: "flat" | "bordered";
  disallowEmptySelection?: boolean;
  selectionMode?: "single" | "multiple";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isDisabled?: boolean;
  defaultSelectedKeys?: "all" | Iterable<string>;
  disabledKeys?: Iterable<string>;
}

export function Select({
  label,
  children,
  classNames = {},
  size = "md",
  radius = "md",
  isRequired,
  selectedKeys,
  onChange,
  onSelectionChange,
  placeholder,
  labelPlacement = "inside",
  variant = "flat",
  className,
  disallowEmptySelection,
  selectionMode = "single",
  startContent,
  endContent,
  isDisabled,
  defaultSelectedKeys,
  disabledKeys,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Set<string> | "all">(
    defaultSelectedKeys === "all"
      ? "all"
      : defaultSelectedKeys !== undefined
      ? new Set(defaultSelectedKeys)
      : new Set()
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const value =
    selectedKeys === "all"
      ? "all"
      : selectedKeys !== undefined
      ? new Set(selectedKeys)
      : internalValue;
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const itemsArray = flattenChildren(children);

  const handleValueChange = (newValue: string) => {
    let newSet: Set<string>;
    if (selectionMode === "multiple") {
      newSet = value === "all" ? new Set() : new Set(value);
      if (newSet.has(newValue)) {
        if (!disallowEmptySelection || newSet.size > 1) {
          newSet.delete(newValue);
        }
      } else {
        newSet.add(newValue);
      }
    } else {
      if (value === "all" || (value instanceof Set && value.has(newValue))) {
        if (disallowEmptySelection) return;
        newSet = new Set();
      } else {
        newSet = new Set([newValue]);
      }
    }

    if (selectedKeys === undefined) {
      setInternalValue(newSet);
    }
    if (onSelectionChange) onSelectionChange(newSet);
    if (onChange) {
      onChange({ target: { value: Array.from(newSet).join(",") } });
    }
    if (selectionMode !== "multiple") {
      setIsOpen(false);
    }
  };

  let displayValue: React.ReactNode[] = [];
  itemsArray.forEach((child) => {
    const childValue =
      child.props.value !== undefined
        ? child.props.value
        : sanitizeKey(child.key);
    const childValueStr = String(childValue);

    if (
      value === "all" ||
      (value instanceof Set &&
        (value.has(childValue) || value.has(childValueStr)))
    ) {
      displayValue.push(child.props.children);
    }
  });

  const displayString = displayValue.length > 0 ? (
    <div className="flex gap-1 truncate items-center">
        {displayValue.map((child, i) => <React.Fragment key={i}>{i > 0 ? ", " : ""}{child}</React.Fragment>)}
    </div>
  ) : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => Math.min(prev + 1, itemsArray.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else if (focusedIndex >= 0 && focusedIndex < itemsArray.length) {
        const item = itemsArray[focusedIndex];
        const val =
          item.props.value !== undefined
            ? item.props.value
            : sanitizeKey(item.key);
        handleValueChange(val);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const sizes = {
    sm: "h-8 min-h-8 px-2 text-sm",
    md: "h-10 min-h-10 px-3 text-sm",
    lg: "h-12 min-h-12 px-3 text-base",
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const variants = {
    flat: "bg-white/5 border-transparent hover:bg-white/10 focus-within:bg-white/10",
    bordered:
      "bg-transparent border-white/10 border hover:border-white/20 focus-within:border-white/30",
  };

  return (
    <SelectContext.Provider
      value={{
        isOpen,
        setIsOpen,
        value,
        onValueChange: handleValueChange,
        triggerRef,
        contentRef,
        focusedIndex,
        selectionMode,
      }}
    >
      <div
        data-slot="base"
        data-open={isOpen ? "true" : "false"}
        data-focus={isOpen ? "true" : "false"}
        className={twMerge(
          "flex flex-col gap-1 outline-none group w-full",
          classNames.base,
          className,
        )}
        {...props}
      >
        {label && labelPlacement === "outside" && (
          <label
            data-slot="label"
            className={twMerge(
              "text-sm font-medium",
              isRequired
                ? "after:content-['*'] after:text-red-400 after:ms-0.5"
                : "",
              classNames.label,
            )}
          >
            {label}
          </label>
        )}
        <div
          data-slot="trigger"
          data-open={isOpen ? "true" : "false"}
          data-focus={isOpen ? "true" : "false"}
          ref={triggerRef}
          tabIndex={isDisabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={props["aria-label"] || (typeof label === "string" ? label : "Select")}
          onKeyDown={(e) => {
            if (!isDisabled) handleKeyDown(e);
          }}
          onClick={() => {
            if (!isDisabled) setIsOpen(!isOpen);
          }}
          className={twMerge(
            "relative flex items-center justify-between gap-2 px-3 outline-none transition-colors w-full",
            isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            sizes[size] || sizes.md,
            radiuses[radius] || radiuses.md,
            variants[variant] || variants.flat,
            classNames.trigger,
          )}
        >
          {startContent && (
            <div className="flex-shrink-0" data-slot="start-content">
              {startContent}
            </div>
          )}
          <div
            data-slot="inner-wrapper"
            className={twMerge(
              "w-full h-full flex flex-col items-start justify-center flex-grow truncate gap-0.5",
              classNames.innerWrapper,
            )}
          >
            {label && labelPlacement === "inside" && (
              <span
                data-slot="label"
                className={twMerge(
                  "text-xs text-white/50 origin-top-left transition-all",
                  displayString || isOpen
                    ? "scale-100 translateY-0"
                    : "scale-100",
                  classNames.label,
                )}
              >
                {label} {isRequired && <span className="text-red-400">*</span>}
              </span>
            )}
            <span
              data-slot="value"
              className={twMerge(
                "truncate flex",
                !displayString && "text-white/50",
                label &&
                  labelPlacement === "inside" &&
                  !displayString &&
                  !isOpen
                  ? "opacity-0"
                  : "opacity-100",
                classNames.value,
              )}
            >
              {displayString || placeholder}
            </span>
          </div>
          {endContent && (
            <div className="flex-shrink-0 z-10" data-slot="end-content">
              {endContent}
            </div>
          )}
          <ChevronDown
            data-slot="selector-icon"
            className={twMerge(
              "w-4 h-4 text-white/50 transition-transform hover:bg-white/10",
              classNames.selectorIcon,
              isOpen && "rotate-180",
            )}
          />
        </div>
        <SelectMenu classNames={classNames}>{itemsArray}</SelectMenu>
      </div>
    </SelectContext.Provider>
  );
}

function SelectMenu({ children, classNames }: { children: React.ReactElement<any>[]; classNames: any }) {
  const context = useContext(SelectContext);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { updatePosition } = useFloating({
    isOpen: context?.isOpen || false,
    setIsOpen: context?.setIsOpen || (() => {}),
    triggerRef: context?.triggerRef as any,
    contentRef: context?.contentRef as any,
  });

  if (!context) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      ref={(node) => {
        context.contentRef.current = node;
        if (node && context.isOpen) {
          requestAnimationFrame(() => updatePosition());
        }
      }}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
      }}
      data-state={context.isOpen ? "open" : "closed"}
      className={twMerge(
        "z-50 min-w-32 rounded-xl border border-white/10 bg-[#15161b] text-white p-1 shadow-md transition-opacity duration-200 max-h-96",
        context.isOpen
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none",
        classNames?.popoverContent || classNames?.popover,
      )}
    >
      <div
        ref={scrollRef}
        data-slot="listbox-wrapper"
        className={twMerge(
          "flex flex-col w-full max-h-72 overflow-x-hidden overflow-y-auto",
          classNames?.listboxWrapper,
        )}
      >
        <div
          data-slot="listbox"
          role="listbox"
          className={twMerge("flex flex-col w-full gap-0.5", classNames?.list)}
        >
          {children.map((child, index) => {
            const itemKey =
              child.props.value !== undefined
                ? child.props.value
                : sanitizeKey(child.key);
            return React.cloneElement(child, {
              index,
              itemKey,
              key: itemKey || index,
            });
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  value?: string;
  index?: number;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  description?: React.ReactNode;
  textValue?: string;
  itemKey?: string;
  onPress?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  isDisabled?: boolean;
}

export function SelectItem({
  children,
  className,
  value,
  index,
  startContent,
  endContent,
  description,
  textValue,
  itemKey,
  onPress,
  onClick,
  isDisabled,
  ...props
}: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const itemValue =
    itemKey !== undefined ? itemKey : value !== undefined ? value : (props as any).key;
  const isSelected =
    context.value === "all" ||
    (context.value instanceof Set &&
      (context.value.has(itemValue) || context.value.has(String(itemValue))));
  const isFocused = context.focusedIndex === index;

  return (
    <div
      data-slot="item"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected ? "true" : "false"}
      data-focus={isFocused ? "true" : "false"}
      className={twMerge(
        "flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-sm outline-none select-none transition-colors",
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer",
        isSelected ? "bg-white/10 text-white" : "text-white/80",
        isFocused && !isSelected && !isDisabled
          ? "bg-white/10"
          : !isDisabled && "hover:bg-white/10 hover:text-white",
        className,
      )}
      onClick={(e) => {
        if (isDisabled) return;
        if (itemValue !== undefined) context.onValueChange(itemValue);
        if (onPress) onPress(e);
        if (onClick) onClick(e);
      }}
      data-disabled={isDisabled ? "true" : "false"}
      {...props}
    >
      {startContent && (
        <div className="flex-shrink-0" data-slot="start-content">
          {startContent}
        </div>
      )}
      <div
        className="flex flex-col flex-grow truncate"
        data-slot="item-content"
      >
        <span className="truncate">{children}</span>
        {description && (
          <span
            className="text-xs text-white/50 truncate"
            data-slot="description"
          >
            {description}
          </span>
        )}
      </div>
      {endContent && (
        <div className="flex-shrink-0" data-slot="end-content">
          {endContent}
        </div>
      )}
      {isSelected && (
        <svg
          className="w-4 h-4 text-white shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}

