import { NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/TemplateService';

export async function GET() {
    const stats = await TemplateService.getStats();
    return NextResponse.json(stats[0] || {});
}
