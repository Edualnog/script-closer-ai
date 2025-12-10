import { MessageSquare, Wand2, ShieldCheck } from 'lucide-react'

export function DemoSection() {
    return (
        <section className="py-24 bg-[#F9FAFB] border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        Scripts que soam humanos.<br />Respostas que quebram objeções.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Wand2 className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">Script de Abertura</span>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-100 rounded w-full"></div>
                            <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                                "Olá! Notei que você se interessou pelo [Produto]. Posso te mostrar como ele resolve [Problema]?"
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 transform md:-translate-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">Quebra de Objeção</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Cliente: "Tá caro"</span>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                                "Entendo perfeitamente. Mas se você dividir pelo tempo que vai economizar, o custo é menor que um café por dia. Vale o investimento, não?"
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">Follow-up</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                "Oi! Ainda com alguma dúvida sobre o [Produto]? Separei essa condição especial pra fecharmos hoje."
                            </div>
                            <div className="h-2 bg-gray-100 rounded w-1/2 ml-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
