"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { resizeImage } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (content: string, attachments?: File[]) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSend, onTyping, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isUploading = false;

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const validateFileSecurity = async (file: File): Promise<boolean> => {
        // 1. Check double extensions
        const parts = file.name.split('.');
        if (parts.length > 2) {
            const suspiciousExts = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'html', 'htm', 'vbs', 'scr', 'dll'];
            if (suspiciousExts.some(ext => parts.includes(ext.toLowerCase()))) {
                toast.error(`Security alert: Suspicious double extension in ${file.name}`);
                return false;
            }
        }

        // 2. Read first few bytes for Magic Number checks
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const arr = (new Uint8Array(e.target?.result as ArrayBuffer)).subarray(0, 4);
                const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                
                // Check if it claims to be a zip
                if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip') {
                    if (!header.startsWith('504B0304') && !header.startsWith('504B0506') && !header.startsWith('504B0708')) {
                        toast.error(`Security alert: Invalid ZIP signature in ${file.name}. File spoofing detected.`);
                        resolve(false);
                        return;
                    }
                }

                // Check if it claims to be text
                if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
                    const binarySignatures = ['4D5A', '7F454C46', '25504446', '89504E47', 'FFD8FF', '504B0304'];
                    if (binarySignatures.some(sig => header.startsWith(sig))) {
                        toast.error(`Security alert: Text file ${file.name} contains binary signatures.`);
                        resolve(false);
                        return;
                    }
                }

                // Also check for executable mime types that might slip through
                const dangerousMimeTypes = ['application/x-msdownload', 'application/x-sh', 'application/javascript', 'text/html'];
                if (dangerousMimeTypes.includes(file.type)) {
                    toast.error(`Security alert: Executable file types are not allowed.`);
                    resolve(false);
                    return;
                }

                resolve(true);
            };
            reader.onerror = () => {
                toast.error(`Error reading file ${file.name}`);
                resolve(false);
            };
            
            // For text files, read more to check for null bytes (binary content spoofed as text)
            if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
                 const fullReader = new FileReader();
                 fullReader.onloadend = (e) => {
                     const textArr = new Uint8Array(e.target?.result as ArrayBuffer);
                     // Check first 8KB for null bytes
                     const scanLength = Math.min(textArr.length, 8192);
                     for(let i=0; i<scanLength; i++) {
                         if(textArr[i] === 0) {
                             toast.error(`Security alert: Binary content detected in text file ${file.name}.`);
                             resolve(false);
                             return;
                         }
                     }
                     // If passed null byte check, do the magic byte check
                     reader.readAsArrayBuffer(file.slice(0, 4));
                 };
                 fullReader.onerror = () => resolve(false);
                 fullReader.readAsArrayBuffer(file.slice(0, 8192));
            } else {
                 reader.readAsArrayBuffer(file.slice(0, 4));
            }
        });
    };

    const processFiles = async (fileList: File[]) => {
        if (files.length + fileList.length > 4) {
            toast.error("Maximum 4 files allowed");
            return;
        }

        const processedFiles: File[] = [];

        for (const file of fileList) {
            const isImage = file.type.startsWith("image/");
            const isZip = file.type === "application/zip" || file.name.toLowerCase().endsWith('.zip');
            const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith('.txt');

            if (!isImage && !isZip && !isTxt) {
                toast.error(`File type not allowed for ${file.name}. Only images, zip, and txt are permitted.`);
                continue;
            }

            // High Security Validation
            const isSafe = await validateFileSecurity(file);
            if (!isSafe) continue;

            if (isImage) {
                try {
                    const resized = await resizeImage(file);
                    processedFiles.push(resized);
                } catch (error) {
                    console.error("Failed to resize image:", error);
                    processedFiles.push(file); // Fallback to original
                }
            } else {
                // Limit non-image file sizes (e.g. max 15MB for ZIP, 5MB for TXT)
                if (isZip && file.size > 15 * 1024 * 1024) {
                    toast.error(`Zip file ${file.name} is too large. Max 15MB.`);
                    continue;
                }
                if (isTxt && file.size > 5 * 1024 * 1024) {
                    toast.error(`Text file ${file.name} is too large. Max 5MB.`);
                    continue;
                }
                processedFiles.push(file);
            }
        }

        setFiles(prev => [...prev, ...processedFiles]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!content.trim() && files.length === 0) || disabled || isSending || isUploading) return;

        // Clear typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        onTyping?.(false);

        setIsSending(true);
        try {
            await onSend(content.trim(), files);

            setContent("");
            setFiles([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContent(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }

        // Typing indicator logic
        if (onTyping) {
            if (value.trim()) {
                onTyping(true);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set new timeout to stop typing after 2 seconds of inactivity
                typingTimeoutRef.current = setTimeout(() => {
                    onTyping(false);
                }, 2000);
            } else {
                onTyping(false);
            }
        }
    };

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const pastedFiles: File[] = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            processFiles(pastedFiles);
        }
    }, [files]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            processFiles(newFiles);
        }
        // Reset input
        e.target.value = "";
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || isSending) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    }, [disabled, isSending, files]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "flex flex-col gap-2 p-4 border-t border-white/10 bg-black/20 transition-colors",
                isDragging && "bg-white/5 border-purple-500/50"
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
            }}
            onDrop={handleDrop}
        >
            {/* File Previews */}
            {files.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {files.map((file, i) => (
                        <div key={i} className="relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                            {file.type.startsWith("image/") ? (
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-1 text-center break-all">
                                    {file.name.split('.').pop()}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-3">
                {/* File Attachment Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending || isUploading || files.length >= 4}
                    className="shrink-0 h-10 w-10 mb-1 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Attach files"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,application/zip,text/plain,.zip,.txt"
                />

                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={placeholder}
                        disabled={disabled || isSending || isUploading}
                        rows={1}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={(!content.trim() && files.length === 0) || disabled || isSending || isUploading}
                    className="shrink-0 h-10 w-10 mb-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSending || isUploading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>
        </form>
    );
}
