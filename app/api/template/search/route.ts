import {NextRequest, NextResponse} from 'next/server';
import {TemplateService} from '@/lib/services/TemplateService';

export async function GET(req: NextRequest) {
    try {

        const {searchParams} = new URL(req.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');
        const isFree = searchParams.get('free') === "1";
        const isFramer = searchParams.get("framer") === "1";
        const isCoded = searchParams.get("coded") === "1";
        const tags = searchParams.get("tags")?.split(",").map(tag => tag.trim()) || [];
        const categories = searchParams.get("categories")?.split(",").map(id => id.trim()) || [];

        let query: any = {};

        if (search) query.search = search;
        if (isFree) query.free = true;
        if (isFramer) query.framer = true;
        if (isCoded) query.coded = true;
        if (tags.length !== 0) query.tags = tags;
        if (categories.length !== 0) query.categories = categories;

        const results = await TemplateService.searchTemplates(query, limit, skip);

        return NextResponse.json({success: true, data: results});
    } catch (err) {
        return NextResponse.json({success: false, message: err}, {status: 400})
    }
}
