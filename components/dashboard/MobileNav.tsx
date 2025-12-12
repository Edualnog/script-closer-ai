'use client'

import { useState } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'
import { SidebarContent } from './Sidebar'
import Link from 'next/link'

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 lg:hidden">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white shadow-sm">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">ScriptCloser</span>
                </Link>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-800/50 z-50 lg:hidden fade-in-0"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Reuse SidebarContent but add padding for the close button if needed or specific mobile styles */}
                <SidebarContent onClose={() => setIsOpen(false)} />
            </div>
        </>
    )
}
