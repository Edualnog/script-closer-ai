import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed w-full z-50 top-0 start-0 glass border-b border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-indigo-500" />
                        <span className="font-bold text-xl text-foreground">ScriptCloser AI</span>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href="/login"
                            className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="bg-[#171717] hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-gray-500/20"
                        >
                            Começar grátis
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
