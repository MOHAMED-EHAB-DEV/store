import { NextRequest, NextResponse } from 'next/server';
import Template from '@/lib/models/Template';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!categoryId) return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });

    const templates = await Template.findByCategory(categoryId, limit, skip);
    return NextResponse.json(templates);
}
