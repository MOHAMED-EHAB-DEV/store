import { MetadataRoute } from 'next';

async function getTemplates() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://mhd-store.vercel.app'}/api/template`, {
            next: { revalidate: 60 * 60 * 24 },
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.data || []
    } catch (error) {
        console.error('Error fetching templates for sitemap:', error)
        return []
    }
}

async function getBlogs() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://mhd-store.vercel.app'}/api/blogs?limit=100`, {
            next: { revalidate: 60 * 60 * 24 },
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.success ? data.data : []
    } catch (error) {
        console.error('Error fetching blogs for sitemap:', error)
        return []
    }
}

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