import { NextResponse } from 'next/server';
import Template from '@/lib/models/Template';

export async function GET() {
    const stats = await Template.getTemplateStats();
    return NextResponse.json(stats[0] || {});
}
