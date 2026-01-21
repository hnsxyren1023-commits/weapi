
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ApiEntry } from '@/lib/types'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const supabase = await createClient()

    let query = supabase.from('apis').select('*')

    if (category && category !== 'All') {
        query = query.eq('category', category)
    }

    if (search) {
        query = query.ilike('title', `%${search}%`)
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
        console.error('Supabase Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map Supabase DB schema to ApiEntry frontend type
    const apis: ApiEntry[] = data.map((item: any) => ({
        id: item.id,
        name: item.title,
        description: item.description,
        auth: item.auth_type || 'Unknown',
        https: item.https ?? true,
        cors: 'Unknown',
        link: `/explore/${item.id}`, // Internal link to details page
        category: item.category,
        atoms_cost: 0,
        is_active: item.status === 'published'
    }))

    return NextResponse.json(apis)
}
