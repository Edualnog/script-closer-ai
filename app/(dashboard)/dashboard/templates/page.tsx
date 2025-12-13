'use client'

import { TemplateLibrary } from '@/components/dashboard/TemplateLibrary'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

export default function TemplatesPage() {
    const router = useRouter()

    const handleSelectTemplate = (template: any) => {
        // Store template data in sessionStorage to use in the command center
        sessionStorage.setItem('selected_template', JSON.stringify(template))
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Templates de Scripts</h1>
                            <p className="text-sm text-gray-500">Escolha um template pronto para começar mais rápido</p>
                        </div>
                    </div>
                </div>

                {/* Template Library */}
                <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
            </div>
        </div>
    )
}
