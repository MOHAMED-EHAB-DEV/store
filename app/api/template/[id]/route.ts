import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/TemplateService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const template = await TemplateService.findById(id);
        return NextResponse.json({success: true, data: template,}, {status: 200});
    } catch (err) {
        console.log(`Error while getting the template: ${err}`);
        return NextResponse.json({message: err, success: false}, {status: 500})
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await req.json();
        const updated = await TemplateService.updateTemplate(id, body);
        return NextResponse.json({success: true, message: "Template Updated Successfully", data: updated}, {status: 200});
    } catch (err) {
        console.log(`Error while updating the template: ${err}`);
        return NextResponse.json({success:false, message: err}, {status: 500});
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await TemplateService.deleteTemplate(id, true); // soft delete
        return NextResponse.json({success: true, message: "Template disabled Successfully"});
    } catch (err) {
        console.log(`Error while disabling the template: ${err}`);
        return NextResponse.json({success:false, message: err}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const deleted = await TemplateService.deleteTemplate(id, false); // Delete from database
        return NextResponse.json({success: true, message: "Template deleted Successfully"});
    } catch (err) {
        console.log(`Error while deleting the template: ${err}`);
        return NextResponse.json({success: false, message: err}, {status: 500});
    }
}
