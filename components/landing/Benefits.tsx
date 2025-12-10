import { MessageCircle, Zap, Image, History } from 'lucide-react'

const benefits = [
    {
        icon: MessageCircle,
        title: 'Nunca mais trave no "o que responder?"',
        description: 'Tenha a resposta perfeita na ponta da língua e não perca o timing da venda.',
    },
    {
        icon: Zap,
        title: 'Otimizado para WhatsApp e Instagram',
        description: 'Formatos curtos e diretos. Aumente sua taxa de resposta em até 3x.',
    },
    {
        icon: Image,
        title: 'Transforme foto em argumento',
        description: 'Nossa IA "enxerga" os detalhes do produto e cria desejos que você não viu.',
    },
    {
        icon: History,
        title: 'Follow-up sem ser chato',
        description: 'Saiba exatamente quando chamar o cliente de volta e recupere vendas perdidas.',
    },
]

export function Benefits() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="p-6 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                            <div className="w-10 h-10 bg-[#f4f4f5] rounded-lg flex items-center justify-center mb-4 text-gray-900">
                                <benefit.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-500">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
