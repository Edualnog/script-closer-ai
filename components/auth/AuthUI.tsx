"use client";

import * as React from "react";
import { useState, useId, useEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// UI Components
const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200"
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                outline: "border border-gray-700 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white backdrop-blur-sm",
                secondary: "bg-gray-800 text-gray-100 hover:bg-gray-700",
                ghost: "hover:bg-gray-800 hover:text-gray-100",
                link: "text-blue-400 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-md px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-3 text-sm text-gray-100 shadow-sm transition-all placeholder:text-gray-500 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, label, ...props }, ref) => {
        const id = useId();
        const [showPassword, setShowPassword] = useState(false);
        const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
        return (
            <div className="grid w-full items-center gap-2">
                {label && <Label htmlFor={id}>{label}</Label>}
                <div className="relative">
                    <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-gray-400 transition-colors hover:text-gray-200 focus-visible:text-gray-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                        {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
                    </button>
                </div>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";

// Star Background Component
function StarsBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            const starCount = Math.floor((canvas.width * canvas.height) / 3000);
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5,
                    speed: Math.random() * 0.2 + 0.05,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        };

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";

            stars.forEach((star) => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();

                // Move star
                star.y -= star.speed;

                // Reset if out of bounds
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }
            });
            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(drawStars);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        drawStars();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 bg-black"
        />
    );
}

// Forms
import { PostSignupPricing } from "@/components/auth/PostSignupPricing";

// ... [previous code]

// Forms
function SignInForm() {
    // ... [same implementation as before]
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.refresh();
            const hasPendingScript = localStorage.getItem('pending_script_generation');
            if (hasPendingScript) {
                router.push('/app/generate');
            } else {
                router.push('/app');
            }
        } catch (error: any) {
            setError(error.message || 'Erro ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Bem-vindo de volta</h1>
                <p className="text-sm text-gray-400">Entre na sua conta para continuar</p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <PasswordInput
                    name="password"
                    label="Senha"
                    required
                    autoComplete="current-password"
                    placeholder="Sua senha segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                        {error}
                    </div>
                )}
                <Button type="submit" size="lg" className="mt-2 w-full font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar'}
                </Button>
            </div>
        </form>
    );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        plano_atual: 'free',
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            if (data.session) {
                // Instead of redirecting immediately, trigger success callback (show pricing)
                onSuccess();
            } else {
                setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
            }
        } catch (error: any) {
            setError(error.message || 'Erro ao cadastrar.');
        } finally {
            setLoading(false);
        }
    };

    if (message) {
        return (
            <div className="mt-8 bg-green-500/10 border border-green-500/20 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-green-400">Verifique seu email</h3>
                <p className="mt-2 text-base text-gray-300">{message}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Crie sua conta</h1>
                <p className="text-sm text-gray-400">Comece sua jornada gratuitamente</p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <PasswordInput
                    name="password"
                    label="Senha"
                    required
                    autoComplete="new-password"
                    placeholder="Crie uma senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                        {error}
                    </div>
                )}
                <Button type="submit" size="lg" className="mt-2 w-full font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Criar conta'}
                </Button>
            </div>
        </form>
    );
}

// Container
export function AuthUI({ initialIsSignIn = true }: { initialIsSignIn?: boolean }) {
    const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
    const [showPricing, setShowPricing] = useState(false);
    const router = useRouter();

    const toggleForm = () => setIsSignIn((prev) => !prev);

    const handlePlanSelect = (plan: string) => {
        // Logic to handle plan selection (e.g., redirect to Stripe)
        // For now, regardless of plan, we go to /app as per request flow "to know which plan... but appear only first time"
        // In a real app, this would trigger checkout for paid plans.
        console.log("Selected plan:", plan);
        router.push('/app');
    };

    const handleClosePricing = () => {
        router.push('/app');
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
            <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

            {/* Dynamic Background */}
            <StarsBackground /> {/* Assume StarsBackground is defined above in the file, keeping it */}

            {/* Decorative Gradients for Space Effect */}
            <div className="fixed inset-0 bg-gradient-to-b from-black via-slate-900/40 to-slate-900/0 pointer-events-none z-0" />
            <div className="fixed -bottom-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none z-0" />
            <div className="fixed -top-[50%] -right-[20%] w-[100%] h-[100%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none z-0" />

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Voltar</span>
                </Link>
            </div>

            {showPricing ? (
                <PostSignupPricing onSelectPlan={handlePlanSelect} onClose={handleClosePricing} />
            ) : (
                /* Main Card */
                <div className="relative z-10 w-full max-w-[420px] bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-500">

                    {isSignIn ? <SignInForm /> : <SignUpForm onSuccess={() => setShowPricing(true)} />}

                    <div className="mt-6 text-center text-sm text-gray-400">
                        {isSignIn ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                        <button
                            className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-all"
                            onClick={toggleForm}
                        >
                            {isSignIn ? "Inscrever-se" : "Entrar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
