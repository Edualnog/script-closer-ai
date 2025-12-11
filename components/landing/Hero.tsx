import Link from 'next/link'
import { Plus } from 'lucide-react'
import { HeroProductForm } from './HeroProductForm'

export function Hero() {
    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

            {/* Headlines */}
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-[#171717] mb-6 max-w-5xl mx-auto">
                Aumente em até 3x suas vendas no WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient bg-[length:200%_auto]">com scripts de IA</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
                Para infoprodutores e social sellers no WhatsApp/Instagram. Receba mensagens de abertura, quebras de objeção e roteiros que transformam leads em vendas.
            </p>

            {/* Interactive Form */}
            <HeroProductForm />

            {/* Read More Link */}
            <div className="flex justify-center">
                <Link
                    href="#how-it-works"
                    className="text-gray-500 hover:text-gray-900 font-medium transition-colors border-b border-transparent hover:border-gray-300 pb-0.5"
                >
                    Ver como funciona
                </Link>
            </div>

        </section>
    )
}
