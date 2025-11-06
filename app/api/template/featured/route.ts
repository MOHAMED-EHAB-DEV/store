import {NextRequest, NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/database";
import Template from "@/lib/models/Template";
import Review from "@/lib/models/Review";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const templates = await Template.find({
            categories: {
                $in: ['6895e37824be395fbc0b72ae']
            },
            isActive: true,
        }).select('_id title description thumbnail price tags categories averageRating').populate('categories', "name").limit(4).lean();

        const templatesWithReviews = await Promise.all(templates.map(
            async (template) => {
                const id = template?._id;

                const reviews = await Review.countDocuments({template: id});

                return {
                    ...template,
                    reviews: reviews ?? 0,
                }
            })
        );

        return NextResponse.json(
            {success: true, data: templatesWithReviews},
            {status: 200}
        );
    } catch (err) {
        console.error("Error fetching popular templates:", err);
        return NextResponse.json({success: false, error: err}, {status: 500});
    }
}