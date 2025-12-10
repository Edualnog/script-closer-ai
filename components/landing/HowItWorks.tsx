import { UploadCloud, Sparkles, Copy } from 'lucide-react'

const steps = [
    {
        icon: UploadCloud,
        title: '1. Envie foto + info',
        description: 'Faça upload da foto do seu produto ou descreva ele em poucas palavras.',
    },
    {
        icon: Sparkles,
        title: '2. A IA cria tudo',
        description: 'Nossa tecnologia analisa a imagem e gera scripts persuasivos em segundos.',
    },
    {
        icon: Copy,
        title: '3. Copie e venda',
        description: 'Receba roteiros prontos para WhatsApp, Instagram e anúncios.',
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    {steps.map((step, index) => (
                        <div key={index} className="group">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#635BFF]/10 transition-colors">
                                <step.icon className="h-6 w-6 text-gray-900 group-hover:text-[#635BFF] transition-colors" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
