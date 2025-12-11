import { TestimonialCard } from "@/components/ui/testimonial-card"

const testimonials = [
    {
        text: "A IA captou exatamente o tom que eu queria. Meus clientes nem percebem que é script!",
        author: {
            name: "Mariana S.",
            role: "Loja de Roupas",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
        }
    },
    {
        text: "Salvou meu lançamento. Gere script de quebra de objeção em segundos e fechei 3 vendas na hora.",
        author: {
            name: "Pedro H.",
            role: "Infoprodutor",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=faces"
        }
    },
    {
        text: "Sempre travava na hora de falar o preço. Agora tenho confiança pra negociar.",
        author: {
            name: "Carla M.",
            role: "Esteticista",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
        }
    },
    {
        text: "Muito prático. Tiro foto do produto, a IA cria a copy e eu só mando no Zap.",
        author: {
            name: "João V.",
            role: "Vendedor Autônomo",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces"
        }
    },
    {
        text: "Aumentei minha taxa de resposta em 40% usando os scripts de primeiro contato.",
        author: {
            name: "Luciana R.",
            role: "Corretora",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces"
        }
    },
    {
        text: "Melhor investimento do mês. Pago o plano Pro com uma venda que recuperei.",
        author: {
            name: "Rafael D.",
            role: "SaaS Sales",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
        }
    },
]

export function Testimonials() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                    Quem usa, vende mais.
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Junte-se a vendedores que profissionalizaram seu atendimento.
                </p>
            </div>

            <TestimonialsSection />

            <p className="text-xs text-gray-400 text-center mt-12">
                *Resultados típicos variam de acordo com o nicho e estratégia.
            </p>
        </section>
    )
}

function TestimonialsSection() {
    return (
        <div
            className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background"
            style={{
                // @ts-ignore
                "--duration": "40s",
                "--gap": "1.5rem"
            }}
        >
            <div className="flex w-full flex-row gap-6 marquee-container">
                {/* First track */}
                <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <TestimonialCard key={`t1-${idx}`} {...testimonial} />
                    ))}
                </div>
                {/* Second track (duplicate for seamless loop) */}
                <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <TestimonialCard key={`t2-${idx}`} {...testimonial} />
                    ))}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
    );
}
