import Link from "next/link";
import TemplateComponent from "@/components/shared/Template";
import { ITemplate } from "@/lib/validations/template";
import SplitText from "@/components/ui/SplitText";
import EmptyState from "@/components/shared/EmptyState";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";

async function getTemplates(): Promise<ITemplate[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/template/featured`,
      { next: { revalidate: 60 * 60 * 24 * 7, tags: ["home-templates"] } },
    );
    const data = await response.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

const FeaturedTemplates = async () => {
  const templates: ITemplate[] = await getTemplates();

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 relative overflow-hidden"
      aria-labelledby="featured-templates-title"
    >

      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-18 max-w-4xl mx-auto">
          {/* Section Headline */}
          <h2
            id="featured-templates-title"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-paras tracking-tight leading-tight"
          >
            {SplitText("Engineered for ")}
            <span className="relative inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {SplitText("Velocity & Polish")}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {SplitText(
              "Production-ready Next.js codebases built with strict TypeScript schemas, sub-second Core Web Vitals, and world-class design fidelity.",
            )}
          </p>
        </div>

        {/* Templates Grid or Empty State */}
        {!templates || templates.length === 0 ? (
          <EmptyState
            variant="card"
            title="No featured templates available"
            description="We're currently curating our next batch of high-performance flagship templates. Explore our full template directory or request a custom build."
            primaryAction={{
              label: "Explore All Templates",
              href: "/templates",
            }}
            secondaryAction={{
              label: "Request Custom Build",
              href: "/custom-development",
              variant: "outline",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {templates.map((template) => (
              <div
                key={template._id}
                className="relative group/card transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Subtle ambient card backdrop glow on hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-cyan-500/20 opacity-0 group-hover/card:opacity-100 blur-xl transition-opacity duration-500"
                />
                <div className="relative z-10 h-full">
                  <TemplateComponent template={template} mode="store" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All & Custom CTA */}
        <div className="text-center mt-12 sm:mt-16 flex flex-col items-center justify-center gap-4">
          <MagneticButton strength={15}>
            <Link
              href="/templates"
              aria-label="Explore all templates"
              className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-8 sm:px-10 py-4 rounded-full font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore All Templates
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  aria-hidden="true"
                />
              </span>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
          </MagneticButton>

          <p className="text-xs sm:text-sm text-neutral-400">
            Looking for something tailored?{" "}
            <Link
              href="/custom-development"
              className="text-purple-300 hover:text-purple-200 underline underline-offset-4 transition-colors font-medium"
            >
              Book a custom build &rarr;
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTemplates;

