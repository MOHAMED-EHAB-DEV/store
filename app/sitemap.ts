import { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import Template from '@/lib/models/Template';
import Blog from '@/lib/models/Blog';

// Cache templates for 48 hours
const getTemplates = unstable_cache(
    async () => {
        try {
            await connectToDatabase();
            const templates = await Template.find({ isActive: true })
                .select('_id updatedAt')
                .lean();
            return JSON.parse(JSON.stringify(templates));
        } catch (error) {
            console.error('Error fetching templates for sitemap:', error);
            return [];
        }
    },
    ['sitemap-templates'],
    { revalidate: 60 * 60 * 48 } // 48 hours
);

// Cache blogs for 48 hours
const getBlogs = unstable_cache(
    async () => {
        try {
            await connectToDatabase();
            const blogs = await Blog.find({ isPublished: true })
                .select('_id slug updatedAt')
                .limit(100)
                .lean();
            return JSON.parse(JSON.stringify(blogs));
        } catch (error) {
            console.error('Error fetching blogs for sitemap:', error);
            return [];
        }
    },
    ['sitemap-blogs'],
    { revalidate: 60 * 60 * 48 } // 48 hours
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mhd-store.vercel.app'

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/templates`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/support`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faqs`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
    ]

    // Dynamic template pages
    const templates = await getTemplates()
    const templatePages = templates.map((template: any) => ({
        url: `${baseUrl}/templates/${template._id}`,
        lastModified: template.updatedAt ? new Date(template.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // Dynamic blog pages
    const blogs = await getBlogs()
    const blogPages = blogs.map((blog: any) => ({
        url: `${baseUrl}/blog/${blog.slug || blog._id}`,
        lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [
        ...staticPages,
        ...templatePages,
        ...blogPages,
    ]
}