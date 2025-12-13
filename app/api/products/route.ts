import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List user's products
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, description')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
            return NextResponse.json({ error: 'Falha ao buscar produtos' }, { status: 500 })
        }

        return NextResponse.json(products || [])

    } catch (error) {
        console.error('Error in products API:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
