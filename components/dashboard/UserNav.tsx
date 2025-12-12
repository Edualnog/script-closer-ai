"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, LogOut, CreditCard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserNav() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Initial fetch
                setUserEmail(user.email || "Usuário");
                const { data: profile } = await supabase
                    .from('users')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }

                // Realtime subscription for avatar updates
                const channel = supabase
                    .channel(`user_avatar_${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'users',
                            filter: `id=eq.${user.id}`
                        },
                        (payload) => {
                            const newAvatar = (payload.new as any).avatar_url;
                            if (newAvatar) {
                                setAvatarUrl(newAvatar);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };
        getUser();
    }, [supabase]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        localStorage.removeItem('pending_script_generation');
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <div className="absolute top-4 right-4 z-50 md:fixed" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all group"
            >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-indigo-600 overflow-hidden bg-indigo-50 border border-gray-100">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-3.5 h-3.5" />
                    )}
                </div>
                <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                    {userEmail?.split('@')[0]}
                </span>
                <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-semibold text-gray-900">Minha Conta</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>

                    <div className="px-1 space-y-0.5">
                        <Link
                            href="/dashboard/billing"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Configurações & Planos
                        </Link>
                        {/* 
                        <Link
                            href="/dashboard/billing" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <CreditCard className="w-4 h-4" />
                            Assinatura
                        </Link> 
                        */}
                    </div>

                    <div className="px-1 mt-1 border-t border-gray-50 pt-1">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair da Conta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
