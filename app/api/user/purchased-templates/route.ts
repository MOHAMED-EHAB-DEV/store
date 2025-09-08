import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { UserService } from "@/lib/services/UserService";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";

export async function GET() {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, true);
        if (!user) return NextResponse.json({success: false, message: "unauthorized access"}, {status: 400});

        const purchasedTemplates = (await User.findOne(user._id).select("purchasedTemplates"))?.purchasedTemplates;
        if (!purchasedTemplates) return NextResponse.json({success: false, message: "Something went error"}, {status:400});

        return NextResponse.json({success: true, data: purchasedTemplates}, {status: 200});
    } catch (err) {
        return NextResponse.json({success: false, message: `Error while getting purchased templates: ${err}`}, {status: 500});
    }
}