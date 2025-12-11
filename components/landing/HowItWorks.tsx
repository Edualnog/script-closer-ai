import { UploadCloud, Sparkles, Copy } from 'lucide-react'

const steps = [
    {
        icon: UploadCloud,
        title: '1. Envie foto, áudio ou texto',
        description: 'Descreva seu produto como preferir. Pode ser uma foto, uma mensagem de voz ou texto rápido.',
        example: '"Tênis de corrida leve, azul, ideal para maratonas."',
    },
    {
        icon: Sparkles,
        title: '2. A IA cria a estratégia',
        description: 'Nossa tecnologia analisa o contexto, objeções e perfil do cliente para gerar a resposta ideal.',
        example: 'Analisando: Tênis Esportivo > Público Atleta...',
    },
    {
        icon: Copy,
        title: '3. Copie e venda',
        description: 'Receba roteiros prontos para WhatsApp, Instagram e anúncios. É só copiar e fechar.',
        example: '"Olá! Vi que busca performance. Esse modelo..."',
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {steps.map((step, index) => (
                        <div key={index} className="group p-8 rounded-2xl border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(to_bottom,theme(colors.gray.200),theme(colors.gray.50/0))_border-box] shadow-sm transition-all relative">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#635BFF]/10 transition-colors">
                                <step.icon className="h-6 w-6 text-gray-900 group-hover:text-[#635BFF] transition-colors" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                {step.description}
                            </p>
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-500 font-mono">
                                {step.example}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
