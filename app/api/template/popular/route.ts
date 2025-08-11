import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/TemplateService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const templates = await TemplateService.getPopularTemplates(limit, skip);
    return NextResponse.json({success: true, data: templates}, {status: 200});
}
