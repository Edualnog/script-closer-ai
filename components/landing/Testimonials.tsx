import { cn } from "@/lib/utils"
// import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
// Local import since we just created it in ui/testimonial-card
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

export function Testimonials() {
    const testimonials = [
        {
            author: {
                name: 'Mariana',
                role: 'Loja de Perfumes',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces'
            },
            text: 'Vendi 3 perfumes no mesmo dia usando o ScriptCloser. A IA pegou detalhes das notas olfativas que eu nem tinha notado.',
        },
        {
            author: {
                name: 'Carlos',
                role: 'Consultor de Vendas',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces'
            },
            text: 'Economizei 2h por dia respondendo objeções de preço no WhatsApp. É como ter um copywriter sênior do meu lado.',
        },
        {
            author: {
                name: 'Júlia',
                role: 'Infoprodutora',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'
            },
            text: 'Fiz meu primeiro R$ 1.000 em um fim de semana apenas copiando e colando os scripts de recuperação de boleto.',
        },
        {
            author: {
                name: 'Ricardo',
                role: 'Corretor de Imóveis',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces'
            },
            text: 'Consegui agendar 5 visitas na semana só mudando a abordagem inicial que a IA sugeriu.',
        },
        {
            author: {
                name: 'Ana',
                role: 'Esteticista',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces'
            },
            text: 'A resposta para clientes que somem foi mágica. Recuperei 2 clientes antigas na hora.',
        },
    ]

    return (
        <TestimonialsSection
            title="Quem usa, vende mais."
            description="Junte-se a centenas de vendedores e profissionais que já estão fechando mais negócios com IA."
            testimonials={testimonials}
        />
    )
}

interface TestimonialsSectionProps {
    title: string
    description: string
    testimonials: Array<{
        author: TestimonialAuthor
        text: string
        href?: string
    }>
    className?: string
}

function TestimonialsSection({
    title,
    description,
    testimonials,
    className
}: TestimonialsSectionProps) {
    return (
        <section className={cn(
            "bg-background text-foreground",
            "py-24 border-y border-gray-200 bg-[#F9FAFB]",
            className
        )}>
            <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 text-center sm:gap-16">
                <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
                    <h2 className="max-w-[720px] text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight tracking-tight text-gray-900">
                        {title}
                    </h2>
                    <p className="text-md max-w-[600px] font-medium text-gray-500 sm:text-xl">
                        {description}
                    </p>
                </div>

                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                    <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row w-full [--duration:40s]">
                        <div className="flex shrink-0 items-center [gap:var(--gap)] animate-marquee flex-row">
                            {testimonials.map((testimonial, i) => (
                                <TestimonialCard
                                    key={`first-${i}`}
                                    {...testimonial}
                                />
                            ))}
                        </div>
                        <div className="flex shrink-0 items-center [gap:var(--gap)] animate-marquee flex-row">
                            {testimonials.map((testimonial, i) => (
                                <TestimonialCard
                                    key={`second-${i}`}
                                    {...testimonial}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-[#F9FAFB] to-transparent sm:block" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[#F9FAFB] to-transparent sm:block" />
                </div>
            </div>
        </section>
    )
}
