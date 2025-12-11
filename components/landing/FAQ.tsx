import { Plus } from 'lucide-react'

const faqs = [
    {
        question: 'Como a IA gera os scripts?',
        answer: 'Nossa inteligência artificial analisa o contexto do seu produto, o público-alvo e até a entonação desejada. Diferente do ChatGPT comum, ela é treinada especificamente para conversão e fechamento de vendas.',
    },
    {
        question: 'Posso usar áudio e imagens?',
        answer: 'Sim! Você pode descrever seu produto por voz (usando nosso microfone integrado) ou enviar uma foto do produto/serviço. A IA extrai as informações automaticamente para criar o script.',
    },
    {
        question: 'Funciona para qual nicho?',
        answer: 'Para qualquer um que venda pelo WhatsApp ou Direct. De lojas de roupas e eletrônicos a corretores de imóveis, dentistas e infoprodutores.',
    },
    {
        question: 'Funciona no celular?',
        answer: 'Perfeitamente. O ScriptCloser é uma aplicação web (PWA) otimizada para celular. Você gera o script e copia direto para o WhatsApp em segundos.',
    },
    {
        question: 'Meus dados estão seguros?',
        answer: 'Totalmente. Não usamos seus dados de vendas para treinar modelos públicos. Suas estratégias e informações de clientes permanecem confidenciais.',
    },
]

export function FAQ() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Perguntas frequentes</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-100 bg-gray-50/50 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="text-[#635BFF]">•</span>
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
