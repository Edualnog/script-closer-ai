import { cn } from "@/lib/utils"

export interface TestimonialAuthor {
    name: string
    role: string
    avatar?: string
}

export interface TestimonialCardProps {
    author: TestimonialAuthor
    text: string
    href?: string
    className?: string
}

export function TestimonialCard({
    author,
    text,
    className
}: TestimonialCardProps) {
    return (
        <div className={cn(
            "flex w-[300px] h-[200px] shrink-0 flex-col justify-between gap-4 overflow-hidden rounded-xl border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(to_bottom,theme(colors.gray.200),theme(colors.gray.50/0))_border-box] p-6 shadow-sm transition-all relative",
            className
        )}>
            <blockquote className="text-muted-foreground text-sm leading-relaxed italic">
                "{text}"
            </blockquote>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-muted font-bold text-muted-foreground uppercase text-xs">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                        author.name.substring(0, 2)
                    )}
                </div>
                <div className="flex flex-col text-sm">
                    <span className="font-semibold text-foreground">{author.name}</span>
                    <span className="text-muted-foreground text-xs">{author.role}</span>
                </div>
            </div>
        </div>
    )
}
