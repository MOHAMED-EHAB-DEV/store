"use client";

import React, { forwardRef, useState, useRef, useEffect, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { useFloating } from "@/hooks/use-floating";
import { SelectItem } from "@/components/ui/select";
import { MagnifyingGlass } from "@/components/ui/svgs/icons/MagnifyingGlass";
import { Spinner } from "@/components/ui/spinner";
import { X } from "@/components/ui/svgs/icons/X";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: string;
  [key: string]: any;
}

export interface AutocompleteProps {
  options?: AutocompleteOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option?: AutocompleteOption) => void;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  emptyText?: string;
  className?: string;
  inputClassName?: string;
  clearable?: boolean;
}

export interface AutocompleteRef {
  focus: () => void;
  clear: () => void;
}

export const Autocomplete = forwardRef<AutocompleteRef, AutocompleteProps>(({
  options = [],
  value,
  onValueChange,
  onSearchChange,
  placeholder = "Search user...",
  label,
  disabled = false,
  isLoading = false,
  emptyText = "No results found",
  className,
  inputClassName,
  clearable = true,
}, ref) => {
  const selectedOption = options.find((opt) => opt.value === value);
  const [inputValue, setInputValue] = useState(selectedOption ? selectedOption.label : "");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [visible, setVisible] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => handleClear(),
  }));

  // Sync display text when value prop changes externally
  useEffect(() => {
    const current = options.find((opt) => opt.value === value);
    if (current) {
      setInputValue(current.label);
    } else if (!value) {
      setInputValue("");
    }
  }, [value, options]);

  const { updatePosition } = useFloating({
    isOpen,
    setIsOpen,
    triggerRef,
    contentRef,
    align: "start",
    sideOffset: 4,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    onSearchChange?.(val);
    if (!val && value) {
      onValueChange?.("", undefined);
    }
  };

  const handleSelectOption = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onValueChange?.(option.value, option);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onValueChange?.("", undefined);
    onSearchChange?.("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full text-start", className)}>
      {label && (
        <label className="block text-xs font-semibold text-gray-300 mb-1.5 ms-1">
          {label}
        </label>
      )}

      {/* Outside Input Box (Trigger) */}
      <div ref={triggerRef} className="relative flex items-center">
        <div className="absolute start-3 pointer-events-none text-muted-foreground">
          <MagnifyingGlass className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              onSearchChange?.(inputValue);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 ps-9 pe-10 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-muted-foreground/70 transition-all outline-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
            inputClassName
          )}
        />

        <div className="absolute end-2 flex items-center gap-1">
          {isLoading ? (
            <Spinner className="w-4 h-4 text-muted-foreground animate-spin me-1" />
          ) : clearable && inputValue && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-white rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Box for Results ONLY rendered via Portal at Body Level with Smooth Animations */}
      {shouldRender && mounted && createPortal(
        <div
          ref={(node) => {
            contentRef.current = node;
            if (node && isOpen) {
              requestAnimationFrame(() => updatePosition());
            }
          }}
          data-state={isOpen ? "open" : "closed"}
          className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999] max-w-[calc(100vw-2rem)] sm:max-w-sm md:max-w-md"
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(-4px)",
            transition: "opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "top center",
          }}
        >
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-white/5">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center text-muted-foreground italic">
                {isLoading ? "Loading results..." : emptyText}
              </div>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelectOption(opt)}
                  className="cursor-pointer"
                >
                  <SelectItem
                    value={opt.value}
                    textValue={opt.label}
                    className={cn(
                      "hover:bg-white/10 transition-colors",
                      opt.value === value && "bg-white/10 text-white font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5 py-0.5">
                      {opt.avatar && (
                        <img
                          src={opt.avatar}
                          alt={opt.label}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{opt.label}</p>
                        {opt.sublabel && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

Autocomplete.displayName = "Autocomplete";
