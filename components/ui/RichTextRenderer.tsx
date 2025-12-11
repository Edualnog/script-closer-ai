import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextRendererProps {
    content: string;
    className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
    if (!content) return null;

    // Helper to parse bold/italic within a text segment
    const parseInline = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-gray-800">{part.slice(1, -1)}</em>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Split content by newlines to handle paragraphs/lists
    const lines = content.split('\n');

    return (
        <div className={cn("space-y-1.5 leading-relaxed text-gray-700", className)}>
            {lines.map((line, i) => {
                if (!line.trim()) {
                    return <div key={i} className="h-2" />; // Spacer for empty lines
                }

                // Check for numeric list (e.g., "1. Step")
                const numericMatch = line.match(/^(\d+)\.\s+(.+)/);
                if (numericMatch) {
                    return (
                        <div key={i} className="flex gap-2 pl-1">
                            <span className="font-bold text-indigo-600 min-w-[20px]">{numericMatch[1]}.</span>
                            <span>{parseInline(numericMatch[2])}</span>
                        </div>
                    );
                }

                // Check for bullet list (e.g., "- Item")
                const bulletMatch = line.match(/^[-•]\s+(.+)/);
                if (bulletMatch) {
                    return (
                        <div key={i} className="flex gap-2 pl-1">
                            <span className="font-bold text-indigo-600 min-w-[10px]">•</span>
                            <span>{parseInline(bulletMatch[1])}</span>
                        </div>
                    );
                }

                // Normal paragraph
                return <div key={i}>{parseInline(line)}</div>;
            })}
        </div>
    );
};
