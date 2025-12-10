import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-gray-900" />
                        <span className="font-semibold text-lg text-gray-900 tracking-tight">ScriptCloser AI</span>
                    </div>

                    {/* Nav Links - Desktop */}
                    <nav className="hidden md:flex gap-8">
                        <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Como funciona
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Preços
                        </Link>
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Login
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <div>
                        <Link
                            href="/register"
                            className="bg-[#171717] hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-gray-500/20"
                        >
                            Começar grátis
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
