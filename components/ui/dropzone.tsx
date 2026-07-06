'use client';

import { Upload } from "@/components/ui/svgs/icons/Upload";
import React, { ReactNode, createContext, useContext, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FileRejection = { file: File; errors: { code: string; message: string }[] };
export type DropEvent = React.DragEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

export type DropzoneOptions = {
  accept?: Record<string, string[]>;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
};

type DropzoneContextType = {
  src?: File[];
  accept?: DropzoneOptions['accept'];
  maxSize?: DropzoneOptions['maxSize'];
  minSize?: DropzoneOptions['minSize'];
  maxFiles?: DropzoneOptions['maxFiles'];
};

const renderBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)}${units[unitIndex]}`;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);

export type DropzoneProps = Omit<React.HTMLAttributes<HTMLButtonElement>, 'onDrop' | 'onError'> & DropzoneOptions & {
  src?: File[];
  className?: string;
  disabled?: boolean;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
  onError?: (err: Error) => void;
  children?: ReactNode;
};

export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: File[], event: DropEvent) => {
    const acceptedFiles: File[] = [];
    const fileRejections: FileRejection[] = [];

    files.forEach(file => {
      const errors: { code: string; message: string }[] = [];
      if (maxSize && file.size > maxSize) {
        errors.push({ code: 'file-too-large', message: `File is larger than ${maxSize} bytes` });
      }
      if (minSize && file.size < minSize) {
        errors.push({ code: 'file-too-small', message: `File is smaller than ${minSize} bytes` });
      }
      if (accept) {
        const acceptKeys = Object.keys(accept);
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        const isAccepted = acceptKeys.some(key => {
          if (key === fileType) return true;
          if (key.endsWith('/*') && fileType.startsWith(key.replace('/*', ''))) return true;
          if (accept[key].includes(fileExtension)) return true;
          return false;
        });

        if (!isAccepted) {
          errors.push({ code: 'file-invalid-type', message: 'File type is not accepted' });
        }
      }

      if (errors.length > 0) {
        fileRejections.push({ file, errors });
      } else {
        acceptedFiles.push(file);
      }
    });

    if (maxFiles > 0 && acceptedFiles.length > maxFiles) {
      const extraFiles = acceptedFiles.splice(maxFiles);
      extraFiles.forEach(f => fileRejections.push({ file: f, errors: [{ code: 'too-many-files', message: `Too many files` }] }));
    }

    if (fileRejections.length > 0) {
      const message = fileRejections.at(0)?.errors.at(0)?.message;
      if (message) onError?.(new Error(message));
    } else {
      onDrop?.(acceptedFiles, fileRejections, event);
    }
  }, [accept, maxFiles, maxSize, minSize, onDrop, onError]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDropEvent = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files), e);
    }
  }, [disabled, handleFiles]);

  const onChangeEvent = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files), e);
    }
    // reset input so the same file can be selected again
    e.target.value = '';
  }, [disabled, handleFiles]);

  const onClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const acceptString = accept ? Object.entries(accept).flatMap(([mime, exts]) => [mime, ...exts]).join(',') : undefined;

  return (
    <DropzoneContext.Provider value={{ src, accept, maxSize, minSize, maxFiles }}>
      <Button
        className={cn(
          'relative h-auto w-full flex-col overflow-hidden p-8',
          isDragActive && 'outline-none ring-1 ring-ring',
          className
        )}
        disabled={disabled}
        type="button"
        variant="outline"
        onClick={onClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDropEvent}
        {...props}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={acceptString}
          multiple={maxFiles !== 1}
          disabled={disabled}
          onChange={onChangeEvent} 
          className="hidden" 
        />
        {children}
      </Button>
    </DropzoneContext.Provider>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
};

export type DropzoneContentProps = {
  children?: ReactNode;
  className?: string;
};

const maxLabelItems = 3;

export const DropzoneContent = ({
  children,
  className,
}: DropzoneContentProps) => {
  const { src } = useDropzoneContext();

  if (!src || src.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={`flex ${!children ? "size-8" : "w-20 h-20"} items-center justify-center rounded-md bg-muted text-muted-foreground`}>
          {children ? children : <Upload />}
      </div>
      <p className="my-2 w-full truncate font-medium text-sm">
        {src.length > maxLabelItems
          ? `${new Intl.ListFormat('en').format(
              src.slice(0, maxLabelItems).map((file) => file.name)
            )} and ${src.length - maxLabelItems} more`
          : new Intl.ListFormat('en').format(src.map((file) => file.name))}
      </p>
      <p className="w-full text-wrap text-muted-foreground text-xs">
        Drag and drop or click to replace
      </p>
    </div>
  );
};

export type DropzoneEmptyStateProps = {
  children?: ReactNode;
  className?: string;
};

export const DropzoneEmptyState = ({
  children,
  className,
}: DropzoneEmptyStateProps) => {
  const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();

  if (src && src.length > 0) {
    return null;
  }

  if (children) {
    return children;
  }

  let caption = '';

  if (accept) {
    caption += 'Accepts ';
    caption += new Intl.ListFormat('en').format(Object.keys(accept));
  }

  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`;
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`;
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Upload />
      </div>
      <p className="my-2 w-full truncate text-wrap font-medium text-sm">
        Upload {maxFiles === 1 ? 'a file' : 'files'}
      </p>
      <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        Drag and drop or click to upload
      </p>
      {caption && (
        <p className="text-wrap text-muted-foreground text-xs">{caption}.</p>
      )}
    </div>
  );
};
