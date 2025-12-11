"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    className?: string; // For positioning or styling the button itself
    label?: string; // Optional label if we want text next to icon
}

export function CopyButton({ text, className, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md p-1.5 transition-all text-xs font-medium",
                copied
                    ? "text-green-600 bg-green-50"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-100",
                className
            )}
            title="Copiar"
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="animate-in fade-in slide-in-from-left-1 duration-200">
                        Copiado!
                    </span>
                </>
            ) : (
                <>
                    <Copy className="w-3.5 h-3.5" />
                    {label && <span>{label}</span>}
                </>
            )}
        </button>
    );
}
