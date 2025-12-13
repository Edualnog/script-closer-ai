import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all leads for user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { data: leads, error } = await supabase
            .from('leads')
            .select(`
                *,
                products(nome),
                scripts(mensagem_abertura)
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ leads: leads || [] })

    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ error: 'Falha ao buscar leads' }, { status: 500 })
    }
}

// POST - Create new lead
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { nome, contato, productId, scriptId, notas } = body

        const { data: lead, error } = await supabase
            .from('leads')
            .insert({
                user_id: user.id,
                nome,
                contato,
                product_id: productId || null,
                script_id: scriptId || null,
                notas,
                status: 'novo'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ lead })

    } catch (error) {
        console.error('Error creating lead:', error)
        return NextResponse.json({ error: 'Falha ao criar lead' }, { status: 500 })
    }
}

// PATCH - Update lead status
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { id, status, notas, conversation_history } = body

        const updateData: any = { updated_at: new Date().toISOString() }
        if (status) updateData.status = status
        if (notas !== undefined) updateData.notas = notas
        if (conversation_history) updateData.conversation_history = conversation_history

        const { error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error updating lead:', error)
        return NextResponse.json({ error: 'Falha ao atualizar lead' }, { status: 500 })
    }
}

// DELETE - Remove lead
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
        }

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting lead:', error)
        return NextResponse.json({ error: 'Falha ao deletar lead' }, { status: 500 })
    }
}
