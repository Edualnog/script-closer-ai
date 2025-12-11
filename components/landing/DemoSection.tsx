import { MessageSquare, Zap, RefreshCw } from 'lucide-react'

const features = [
    {
        name: 'Script de Abertura',
        description: 'Abordagens que geram curiosidade.',
        content: `“Olá! Vi que você gostou do [Produto]. Muitos clientes tinham dúvida se ele servia para [Dor X], mas olha esse resultado... 👇”`,
        icon: MessageSquare
    },
    {
        name: 'Quebra de Objeção',
        description: 'Para o "está caro" ou "vou ver com marido".',
        content: `“Entendo! O investimento parece alto, mas se dividir por dias de uso, custa menos que um cafézinho para resolver [Problema Y].”`,
        icon: Zap
    },
    {
        name: 'Follow-up',
        description: 'Recupere clientes sem ser chato.',
        content: `“Oi! Só para não esquecer: liberamos uma condição especial para [Produto] que encerra hoje. Faz sentido vermos isso agora?”`,
        icon: RefreshCw
    },
]

export function DemoSection() {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Scripts que soam humanos (e vendem)
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Esqueça respostas robóticas. Nossa IA aprendeu com os melhores vendedores do Brasil.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Decorative background blur */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors duration-500" />

                            <div className="relative">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 text-gray-900 group-hover:text-[#635BFF] group-hover:bg-[#635BFF]/10 transition-colors">
                                    <feature.icon className="h-6 w-6" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.name}</h3>
                                <p className="text-gray-500 mb-6 text-sm">{feature.description}</p>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-sm text-gray-600 leading-relaxed relative">
                                    <div className="absolute top-3 right-3 flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                    </div>
                                    {feature.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-400 text-center mt-12 italic">
                    *Exemplos fictícios apenas para demonstrar o estilo da IA.
                </p>
            </div>
        </section>
    )
}
