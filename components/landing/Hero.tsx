import Link from 'next/link'
import { Plus } from 'lucide-react'

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

            {/* Manus-style Input Placeholder */}
            <div className="max-w-3xl mx-auto mb-12">
                <div className="relative group cursor-default">
                    <div className="w-full h-16 md:h-20 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center px-4 md:px-6 transition-shadow hover:shadow-md">
                        {/* Fake Upload Button */}
                        <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mr-4 text-gray-400">
                            <Plus className="h-5 w-5" />
                        </div>
                        {/* Fake Placeholder Text */}
                        <span className="text-gray-400 text-lg md:text-xl font-medium">Descreva seu produto...</span>
                    </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                    *Exemplo fictício. O gerador real fica dentro da plataforma.
                </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                    <div className="flex flex-col items-center">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-10 py-4 bg-[#171717] hover:bg-gray-800 text-white font-semibold rounded-lg text-lg transition-all shadow-xl shadow-gray-500/20 mb-3"
                        >
                            Começar grátis
                        </Link>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/50 text-xs font-medium text-gray-500 backdrop-blur-sm shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mb-[1px]"></span>
                                3 scripts gratuitos/mês • Sem cartão
                            </span>
                        </div>
                    </div>
                </div>
                <Link
                    href="#how-it-works"
                    className="mt-6 text-gray-500 hover:text-gray-900 font-medium transition-colors border-b border-transparent hover:border-gray-300 pb-0.5"
                >
                    Ver como funciona
                </Link>
            </div>

        </section>
    )
}
