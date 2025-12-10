import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Logo & Copyright */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">ScriptCloser AI</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} ScriptCloser AI. Todos os direitos reservados.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-6">
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Termos</Link>
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacidade</Link>
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Contato</Link>
                </div>

            </div>
        </footer>
    )
}
