import Link from 'next/link'
import { Plus } from 'lucide-react'
import { HeroProductForm } from './HeroProductForm'

export function Hero() {
    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

            {/* Headlines */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#171717] mb-6">
                Venda muito mais com<br className="hidden md:block" /> scripts de alta conversão.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
                Para infoprodutores e social sellers no WhatsApp/Instagram. Receba mensagens de abertura, quebras de objeção e roteiros que transformam leads em vendas.
            </p>

            {/* Interactive Form */}
            <HeroProductForm />

            <div className="mt-4 flex items-center justify-center gap-2 mb-12">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/50 text-xs font-medium text-gray-500 backdrop-blur-sm shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mb-[1px]"></span>
                    3 scripts gratuitos/mês • Sem cartão
                </span>
            </div>

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
