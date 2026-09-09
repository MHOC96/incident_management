"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  children?: ReactNode;
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
};

function optionsFromChildren(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const element = child as ReactElement<{
      value?: string;
      children?: ReactNode;
      disabled?: boolean;
    }>;

    if (element.type !== "option") {
      return;
    }

    options.push({
      value: String(element.props.value ?? ""),
      label: String(element.props.children ?? ""),
      disabled: element.props.disabled,
    });
  });

  return options;
}

function getPlaceholderLabel(options: SelectOption[]): string {
  const emptyOption = options.find((option) => option.value === "");
  if (emptyOption) {
    return emptyOption.label;
  }

  return options[0]?.label ?? "Select";
}

function matchesSearch(label: string, query: string): boolean {
  return label.toLowerCase().includes(query.trim().toLowerCase());
}

export function Select({
  id,
  value,
  onChange,
  options,
  children,
  hasError = false,
  required = false,
  disabled = false,
  searchable,
  searchPlaceholder = "Search options...",
  className = "",
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const searchId = useId();
  const resolvedOptions = useMemo(
    () => options ?? optionsFromChildren(children),
    [options, children],
  );
  const selectableOptions = resolvedOptions.filter((option) => !option.disabled);
  const normalizedValue = String(value);
  const selected = resolvedOptions.find((option) => option.value === normalizedValue);
  const placeholder = getPlaceholderLabel(resolvedOptions);
  const displayLabel = selected?.label ?? placeholder;
  const showSearch = searchable ?? selectableOptions.length > 4;
  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery.trim()) {
      return selectableOptions;
    }

    return selectableOptions.filter((option) => matchesSearch(option.label, searchQuery));
  }, [selectableOptions, searchQuery, showSearch]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }

    if (showSearch) {
      searchInputRef.current?.focus();
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, showSearch]);

  function emitChange(nextValue: string | number) {
    onChange({
      target: { value: String(nextValue) },
    } as ChangeEvent<HTMLSelectElement>);
  }

  const borderClass = hasError ? "border-danger" : "border-border";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className={`flex h-11 w-full min-w-0 items-center justify-between rounded-[2px] border bg-surface px-3 text-left text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${borderClass}`}
      >
        <span className="truncate">{displayLabel}</span>
        <span aria-hidden="true" className="ml-2 shrink-0 text-text-muted">▾</span>
      </button>

      {open ? (
        <div
          className="absolute top-full right-0 left-0 z-50 mt-1 flex max-h-72 flex-col border border-border bg-surface shadow-sm"
        >
          {showSearch ? (
            <div className="border-b border-border p-2">
              <label htmlFor={searchId} className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                ref={searchInputRef}
                id={searchId}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-[2px] border border-border bg-background px-3 text-sm text-foreground placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredOptions.length === 1) {
                    event.preventDefault();
                    emitChange(filteredOptions[0].value);
                    setOpen(false);
                  }
                }}
              />
            </div>
          ) : null}

          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? placeholder}
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-sm text-text-secondary">No matching options.</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value || "__empty__"}
                  role="option"
                  aria-selected={normalizedValue === option.value}
                >
                  <button
                    type="button"
                    onClick={() => {
                      emitChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-surface-hover ${
                      normalizedValue === option.value
                        ? "bg-primary/5 font-medium text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
