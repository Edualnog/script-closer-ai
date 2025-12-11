import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 relative">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">ScriptCloser AI</span>
                </div>

                {/* Copyright */}
                <p className="text-sm text-gray-500 absolute left-1/2 -translate-x-1/2 hidden md:block">
                    &copy; {new Date().getFullYear()} ScriptCloser AI. Todos os direitos reservados.
                </p>
                <p className="text-sm text-gray-500 md:hidden">
                    &copy; {new Date().getFullYear()} ScriptCloser AI.
                </p>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Termos</Link>
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacidade</Link>
                    <Link
                        href="https://wa.me/5511999999999" // TODO: Add real number
                        target="_blank"
                        className="text-sm font-medium text-[#635BFF] hover:text-[#5349E0] flex items-center gap-1"
                    >
                        Fale com a gente
                    </Link>
                </div>

            </div>
        </footer>
    )
}
