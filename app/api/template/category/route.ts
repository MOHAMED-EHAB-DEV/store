import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/TemplateService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!categoryId) return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });

    const templates = await TemplateService.getByCategory(categoryId, limit, skip);
    return NextResponse.json(templates);
}
