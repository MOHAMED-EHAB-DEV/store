import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import TemplatesTable from "@/components/Admin/TemplatesTable";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";

export const metadata: Metadata = {
    title: "Templates Management | Admin",
    description: "Manage all templates"
};

async function getTemplates(searchParams: { [key: string]: string | undefined }) {
    await connectToDatabase();

    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (searchParams.search) {
        filter.$or = [
            { title: { $regex: searchParams.search, $options: "i" } },
            { description: { $regex: searchParams.search, $options: "i" } }
        ];
    }

    if (searchParams.type) filter.type = searchParams.type;
    if (searchParams.builtWith) filter.builtWith = searchParams.builtWith;
    if (searchParams.isPaid) filter.isPaid = searchParams.isPaid === "true";
    if (searchParams.isActive) filter.isActive = searchParams.isActive === "true";
    if (searchParams.category) filter.categories = searchParams.category;

    try {
        const [templates, total] = await Promise.all([
            Template.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Template.countDocuments(filter)
        ]);

        return {
            templates: JSON.parse(JSON.stringify(templates)),
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
    } catch (error) {
        return { templates: [], pagination: null };
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminTemplatesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { templates, pagination } = await getTemplates(params);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Templates Management</h1>
                    <p className="text-muted-foreground">
                        {pagination?.total || 0} total templates
                    </p>
                </div>
                <Link
                    href="/admin/templates/new"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                    + New Template
                </Link>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4">
                <form className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search templates..."
                        defaultValue={params.search || ""}
                        className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        name="type"
                        defaultValue={params.type || ""}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
                    >
                        <option value="" className="bg-gray-900">All Types</option>
                        <option value="framer" className="bg-gray-900">Framer</option>
                        <option value="coded" className="bg-gray-900">Coded</option>
                        <option value="figma" className="bg-gray-900">Figma</option>
                    </select>
                    <select
                        name="builtWith"
                        defaultValue={params.builtWith || ""}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
                    >
                        <option value="" className="bg-gray-900">All Frameworks</option>
                        <option value="framer" className="bg-gray-900">Framer</option>
                        <option value="figma" className="bg-gray-900">Figma</option>
                        <option value="vite" className="bg-gray-900">Vite</option>
                        <option value="next.js" className="bg-gray-900">Next.js</option>
                    </select>
                    <select
                        name="isActive"
                        defaultValue={params.isActive || ""}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
                    >
                        <option value="" className="bg-gray-900">All Status</option>
                        <option value="true" className="bg-gray-900">Active</option>
                        <option value="false" className="bg-gray-900">Inactive</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Templates Table */}
            <TemplatesTable templates={templates} pagination={pagination} searchParams={params} />
        </div>
    );
}