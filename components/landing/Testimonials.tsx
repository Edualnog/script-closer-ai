export function Testimonials() {
    const testimonials = [
        {
            name: 'Mariana',
            role: 'Loja de Perfumes',
            quote: 'Vendi 3 perfumes no mesmo dia usando o ScriptCloser. A IA pegou detalhes que eu nem tinha notado.',
        },
        {
            name: 'Carlos',
            role: 'Consultor de Vendas',
            quote: 'Economizei 1h por dia respondendo objeções. É como ter um copywriter sênior do meu lado.',
        },
        {
            name: 'Júlia',
            role: 'Empreendedora',
            quote: 'Fiz meu primeiro R$ 1.000 copiando e colando os scripts. Simples assim.',
        },
    ]

    return (
        <section className="py-24 bg-[#F9FAFB] border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">"{t.quote}"</p>
                            <div>
                                <p className="font-semibold text-gray-900">{t.name}</p>
                                <p className="text-sm text-gray-500">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
