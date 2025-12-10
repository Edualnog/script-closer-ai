import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-xl text-gray-900">ScriptCloser AI</span>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Começar grátis
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
