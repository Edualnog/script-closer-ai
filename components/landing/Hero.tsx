import Link from 'next/link'
import { Plus } from 'lucide-react'

export function Hero() {
    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

            {/* Headlines */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#171717] mb-6">
                Venda muito mais com<br className="hidden md:block" /> scripts prontos feitos sob medida.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed">
                Envie uma foto do seu produto e receba mensagens de abertura, objeções, roteiros completos e follow-ups otimizados para WhatsApp e Instagram.
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
                    *Apenas ilustração. O input real fica dentro da plataforma.
                </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#635BFF] hover:bg-[#534be0] text-white font-semibold rounded-lg text-lg transition-all shadow-sm shadow-indigo-200"
                >
                    Começar grátis
                </Link>
                <Link
                    href="#how-it-works"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-lg transition-colors border border-gray-200"
                >
                    Ver como funciona
                </Link>
            </div>

            <p className="text-sm text-gray-500">
                3 scripts gratuitos por mês. Sem cartão de crédito.
            </p>

        </section>
    )
}
