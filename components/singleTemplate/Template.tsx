import Link from "next/link";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Check } from "@/components/ui/svgs/icons/Check";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Framer } from "@/components/ui/svgs/icons/Framer";
import { Figma } from "@/components/ui/svgs/icons/Figma";
import { ITemplate } from "@/lib/validations/template";
import { getThumbnailData } from "@/lib/image-utils";
import { formatCount } from "@/lib/utils";
import Markdown from "./Markdown";
import ReviewsContainer from "@/components/singleTemplate/Reviews/ReviewsContainer";
import DownloadBtn from "./DownloadBtn";
import TemplateThumbnail from "./TemplateThumbnail";
import TemplateFeaturesGrid from "./TemplateFeaturesGrid";
import TemplateServicesCTA from "./TemplateServicesCTA";
import TemplateFAQ from "./TemplateFAQ";
import SimilarTemplatesCarousel from "./SimilarTemplatesCarousel";

interface TemplateProps {
  template: ITemplate;
  similarTemplates: ITemplate[];
}

export default async function Template({
  template,
  similarTemplates,
}: TemplateProps) {
  const { gradientStyle } = getThumbnailData(template.thumbnail);

  const firstCategory =
    template.categories && template.categories.length > 0
      ? typeof template.categories[0] === "string"
        ? {
            name: template.categories[0],
            slug: template.categories[0].toLowerCase(),
          }
        : (template.categories[0] as any)
      : null;

  const typeBadgeConfig = {
    coded: {
      label: "Next.js Template",
      icon: Code2,
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    framer: {
      label: "Framer Template",
      icon: Framer,
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    figma: {
      label: "Figma UI Kit",
      icon: Figma,
      color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    },
  }[template.type || "coded"];

  const TypeIcon = typeBadgeConfig?.icon || Code2;

  return (
    <div className="relative flex flex-col gap-14 sm:gap-18 lg:gap-22 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
      {/* Dynamic Ambient Background Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 w-full max-w-5xl h-[550px] opacity-25 blur-[140px] -z-10 mix-blend-screen transition-all duration-700"
        style={{
          background:
            template.gradient ||
            gradientStyle ||
            "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Breadcrumbs Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-gray-400"
      >
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span className="text-gray-600">/</span>
        <Link href="/templates" className="hover:text-white transition-colors">
          Templates
        </Link>
        {firstCategory && (
          <>
            <span className="text-gray-600">/</span>
            <Link
              href={`/templates/${firstCategory.slug || firstCategory.name.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {firstCategory.name}
            </Link>
          </>
        )}
        <span className="text-gray-600">/</span>
        <span className="text-gray-200 truncate max-w-[200px] sm:max-w-xs">
          {template.title}
        </span>
      </nav>

      {/* 2-Column Balanced Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr] gap-8 lg:gap-10 items-start w-full">
        {/* Left Column: Interactive Media Stage */}
        <div className="flex flex-col gap-3 w-full max-w-lg lg:max-w-none mx-auto lg:mx-0">
          <div className="relative group">
            {/* Type Badge Overlay */}
            <div className="absolute top-3.5 start-3.5 z-30 pointer-events-none">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${typeBadgeConfig.color} shadow-lg`}
              >
                <TypeIcon className="size-3.5" />
                <span>{typeBadgeConfig.label}</span>
              </span>
            </div>

            <TemplateThumbnail
              thumbnail={template.thumbnail}
              title={template.title}
              demoVideo={template.demoVideo}
              description={template.description}
            />
          </div>
        </div>

        {/* Right Column: Decision Hub & Key Stats */}
        <div className="flex flex-col gap-6 w-full">
          {/* Social Proof & Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            {(template.reviewCount ?? 0) > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-semibold">
                <Star className="size-3.5 fill-current text-yellow-400" />
                <span>{template.averageRating?.toFixed(1)}</span>
                <span className="text-yellow-400/60 font-normal">
                  ({template.reviewCount}{" "}
                  {template.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-300">
              <Download className="size-3.5 text-gray-400" />
              <span>{formatCount(template.downloads || 0)} downloads</span>
            </div>

            {(template.views ?? 0) > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-300">
                <Eye className="size-3.5 text-gray-400" />
                <span>{formatCount(template.views || 0)} views</span>
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-paras text-white leading-tight tracking-tight">
              {template.title}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-paras">
                {template.price === 0 ? "Free Download" : `$${template.price}`}
              </span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Royalty-Free Commercial License
              </span>
            </div>
          </div>

          {/* Summary Description */}
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            {template.description}
          </p>

          {/* Categories & Tags Pills */}
          <div className="space-y-3 pt-1">
            {/* Categories as Premium Badge Links */}
            {template.categories && template.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
                  Categories:
                </span>
                {template.categories.map((cat: any) => (
                  <Link
                    href={`/templates/${(cat.slug || cat.name).toLowerCase()}`}
                    key={cat._id || cat.name}
                    style={{ background: gradientStyle }}
                    className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 hover:border-white/40 text-white text-xs font-semibold shadow-xs hover:shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gray-950/30 group-hover:bg-gray-950/15 transition-colors pointer-events-none"
                    />
                    <span className="relative z-10 size-1.5 rounded-full bg-white/80 group-hover:bg-white transition-colors shadow-xs" />
                    <span className="relative z-10">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Tags as Subtle Tech Pills (excluding 'featured') */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {template.tags
                  .filter((tag: string) => tag.toLowerCase() !== "featured")
                  .map((tag: string, idx: number) => (
                    <Link
                      href={`/templates?tags=${tag}`}
                      key={idx}
                      aria-label={`View templates tagged with ${tag}`}
                      className="py-1 px-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-colors rounded-lg text-xs text-gray-300 hover:text-white"
                    >
                      #{tag}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Primary Action Button Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="w-full sm:flex-1">
              <DownloadBtn
                templateId={template._id}
                isFree={template.price === 0}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 text-white rounded-xl font-bold text-base shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              />
            </div>

            {template.demoLink && (
              <Link
                href={template.demoLink}
                target="_blank"
                aria-label={`Open live interactive demo for ${template.title}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-base transition-all duration-300"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                <span>Live Demo</span>
              </Link>
            )}
          </div>

          {/* Trust Signals Guarantee Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-400 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400 shrink-0" />
              <span>Commercial License</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400 shrink-0" />
              <span>Lifetime Updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400 shrink-0" />
              <span>Audited Clean Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400 shrink-0" />
              <span>Instant Download Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: "What's Included" Feature Matrix */}
      <TemplateFeaturesGrid
        type={template.type || "coded"}
        tags={template.tags || []}
      />

      {/* Section: Markdown Documentation & Details with Modern TOC */}
      <section className="flex flex-col gap-6 w-full pt-4 border-t border-white/10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-paras text-white">
            Template Specifications & Guide
          </h2>
          <p className="text-gray-400 text-sm">
            Deep dive into the architecture, features, and setup documentation.
          </p>
        </div>

        <Markdown content={template.content || ""} />
      </section>

      {/* Section: Dual Services Conversion CTA */}
      <TemplateServicesCTA templateTitle={template.title} />

      {/* Section: Buyer Psychology FAQ Accordion */}
      <TemplateFAQ
        templateTitle={template.title}
        templateType={template.type || "coded"}
      />

      {/* Section: Verified Customer Reviews */}
      <ReviewsContainer
        templateId={template._id}
        averageRating={template.averageRating}
        reviewCount={template.reviewCount ?? 0}
      />

      {/* Section: Similar Templates Embla Carousel */}
      {similarTemplates && similarTemplates.length > 0 && (
        <SimilarTemplatesCarousel similarTemplates={similarTemplates} />
      )}
    </div>
  );
}
