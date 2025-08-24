import { mdToHtmlAndHeadings } from '@/lib/markdown';
import TocHighlightClient from '@/components/singleTemplate/TOCHighlight';

type Props = {
    content: string;
};

export default async function Markdown({ content }: Props) {
    const { html, headings } = await mdToHtmlAndHeadings(content);

    return (
        <div className="flex flex-col md:flex-row w-full mx-auto p-4">
            {/* Markdown Content */}
            <div className="md:w-4/5 md:pr-6 prose dark:prose-invert max-w-none text-gray-500">
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
                {/* small spacer */}
            </div>

            {/* TOC Sidebar */}
            <aside className="md:w-1/5 md:pl-4 border-l border-gray-300 dark:border-gray-700">
                <div className="hidden md:block max-h-[80vh] overflow-y-auto">
                    <ul className="space-y-2 text-sm" id="page-toc">
                        {headings.map((h, i) => (
                            <li key={i} className={`pl-${(h.level - 1) * 4} hover:underline`}>
                                <a href={`#${h.id}`} data-toc-id={h.id}>
                                    {h.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Optional client-side enhancements (tiny) */}
            {headings.length > 0 ? <TocHighlightClient /> : null}
        </div>
    );
}
