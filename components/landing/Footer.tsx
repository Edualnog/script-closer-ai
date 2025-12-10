import { Sparkles } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <div className="flex justify-center items-center gap-2 mb-8">
                    <Sparkles className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-400 font-semibold">ScriptCloser AI</span>
                </div>
                <p className="mt-8 text-center text-base text-gray-400">
                    &copy; 2024 ScriptCloser AI. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    )
}
