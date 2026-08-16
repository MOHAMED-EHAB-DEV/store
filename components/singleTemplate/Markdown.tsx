import { mdToHtmlAndHeadings } from "@/lib/markdown";
import TemplateTOC from "@/components/singleTemplate/TemplateTOC";

type Props = {
  content: string;
  disableSidebar?: boolean;
};

export default async function Markdown({
  content,
  disableSidebar = false,
}: Props) {
  const { html, headings } = await mdToHtmlAndHeadings(content);

  return (
    <div className="relative flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full mx-auto">
      {/* Markdown Content Area */}
      <div
        className={`w-full ${
          disableSidebar ? "" : "lg:flex-1"
        } min-w-0 prose dark:prose-invert max-w-none text-gray-300`}
      >
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Redesigned Modern TOC Sidebar */}
      {!disableSidebar && headings && headings.length > 0 && (
        <TemplateTOC headings={headings} />
      )}
    </div>
  );
}
