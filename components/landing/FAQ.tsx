import { Plus } from 'lucide-react'

const faqs = [
    {
        question: 'Como funciona a geração de scripts?',
        answer: 'Nossa IA analisa a imagem do seu produto e o contexto que você fornece (preço, público) para criar roteiros de vendas otimizados usando as melhores técnicas de copywriting.',
    },
    {
        question: 'Posso testar sem pagar?',
        answer: 'Sim! O plano Free oferece 3 scripts completos por mês sem necessidade de cartão de crédito.',
    },
    {
        question: 'Os scripts servem para quais nichos?',
        answer: 'Para qualquer produto físico ou serviço. De roupas e eletrônicos a consultorias e imóveis.',
    },
    {
        question: 'Como funciona o cancelamento?',
        answer: 'Você pode cancelar a qualquer momento direto pelo painel. Sem multas ou fidelidade.',
    },
    {
        question: 'A IA gera imagens também?',
        answer: 'Sim, no plano Pro+ você tem acesso ao gerador de Mockups profissionais para seus produtos.',
    },
]

export function FAQ() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Perguntas frequentes</h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                <Plus className="h-5 w-5 text-gray-400 group-hover:text-[#635BFF] transition-colors" />
                            </div>
                            <p className="mt-2 text-gray-500 hidden group-hover:block transition-all">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
