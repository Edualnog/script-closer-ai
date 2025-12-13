import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all templates
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: templates, error } = await supabase
            .from('script_templates')
            .select('*')
            .order('categoria', { ascending: true })

        if (error) throw error

        return NextResponse.json({ templates: templates || [] })

    } catch (error) {
        console.error('Error fetching templates:', error)
        return NextResponse.json({ error: 'Falha ao buscar templates' }, { status: 500 })
    }
}
