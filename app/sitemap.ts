import { MetadataRoute } from 'next'

async function getTemplates() {
    try {
        // Fetch templates from your API
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mhd-store.vercel.app'}/api/template`, {
            cache: 'no-store',
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.templates || []
    } catch (error) {
        console.error('Error fetching templates for sitemap:', error)
        return []
    }
}

async function getCategories() {
    try {
        // Fetch categories from your API
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mhd-store.vercel.app'}/api/template/category`, {
            cache: 'no-store',
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.categories || []
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mhd-store.vercel.app'

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
            url: `${baseUrl}/signin`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
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

    // Category pages (if you have category routing)
    const categories = await getCategories()
    const categoryPages = categories.map((category: any) => ({
        url: `${baseUrl}/templates?category=${category.slug || category._id}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [
        ...staticPages,
        ...templatePages,
        ...categoryPages,
    ]
}