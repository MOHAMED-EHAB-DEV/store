import { NextRequest } from 'next/server';
import User from '@/lib/models/User';
import { withAPIMiddleware, createAPIResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { authenticateUser } from '@/middleware/auth';
import { connectToDatabase } from '@/lib/database';

// GET: Get user's favorite templates
async function handleGET(req: NextRequest) {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user) return createErrorResponse('unauthorized', 400);

    const favorites = await User.findOne({email: user?.email}).select('favorites').populate('favorites', '_id title description thumbnail price averageRating downloads categories tags demoLink builtWith createdAt');
    
    if (!favorites) return createErrorResponse('User not found', 404);
    return createAPIResponse(favorites?.favorites);
}

// POST: Add/remove favorite template
async function handlePOST(req: NextRequest) {
    const body = await req.json();
    const { userId, templateId, action } = body;
    if (!userId || !templateId || !['add', 'remove'].includes(action)) {
        return createErrorResponse('Missing or invalid parameters', 400);
    }

    const user = await User.findById(userId);
    if (!user) return createErrorResponse('User not found', 404);

    if (action === 'add') {
        if (!user.favorites.includes(templateId)) {
            user.favorites.push(templateId);
            await user.save();
        }
    } else if (action === 'remove') {
        user.favorites = user.favorites.filter(id => id.toString() !== templateId);
        await user.save();
    }

    return createAPIResponse({ favorites: user.favorites });
}

export const GET = withAPIMiddleware(handleGET);
export const POST = withAPIMiddleware(handlePOST);