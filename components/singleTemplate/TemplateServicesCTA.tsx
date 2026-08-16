import Link from "next/link";
import { Wrench } from "@/components/ui/svgs/icons/Wrench";
import { Rocket } from "@/components/ui/svgs/icons/Rocket";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";

interface TemplateServicesCTAProps {
  templateTitle: string;
}

export default function TemplateServicesCTA({
  templateTitle,
}: TemplateServicesCTAProps) {
  const customizationMessage = encodeURIComponent(
    `Hi Mohammed, I would like to customize the "${templateTitle}" template for my brand.`
  );

  return (
    <section
      aria-labelledby="custom-services-heading"
      className="flex flex-col gap-6 w-full mt-4"
    >
      <div className="flex flex-col gap-1 text-center sm:text-start">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
          <Sparkles className="size-3.5" />
          <span>Tailored For Your Brand</span>
        </div>
        <h2
          id="custom-services-heading"
          className="text-2xl sm:text-3xl font-bold font-paras text-white"
        >
          Two Ways We Can Help You Launch Faster
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Option 1: Template Customization */}
        <div className="group relative p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-gray-900/60 to-gray-950/80 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <Wrench className="size-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-paras group-hover:text-purple-300 transition-colors">
                Customize This Template
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Love this design but need your brand colors, custom CMS, custom API
                integrations, or extra pages tailored specifically for you?
              </p>
            </div>

            <ul className="space-y-1.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400" />
                Tailored brand colors & typography
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400" />
                Backend, CMS, or Stripe integration
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-purple-400" />
                Delivered ready to deploy in days
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10">
            <Link
              href={`/support?message=${customizationMessage}&category=template-customization`}
              aria-label={`Request customization for ${templateTitle}`}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 hover:border-purple-400 text-white font-semibold text-sm sm:text-base transition-all duration-300 group/btn"
            >
              <span>Request Template Customization</span>
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Option 2: Full Custom Development */}
        <div className="group relative p-6 sm:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-gray-900/60 to-gray-950/80 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="size-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="size-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-paras group-hover:text-cyan-300 transition-colors">
                Bespoke Custom Build
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Need an entirely bespoke digital product, complex web application,
                or custom SaaS platform engineered from the ground up?
              </p>
            </div>

            <ul className="space-y-1.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-400" />
                100% custom UI/UX design & architecture
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-400" />
                Full-stack Next.js, databases & auth
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-400" />
                Dedicated weekly sprints & milestone tracking
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10">
            <Link
              href="/custom-development"
              aria-label="Explore bespoke custom web development"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600/30 via-teal-600/30 to-emerald-600/30 hover:from-cyan-600/50 hover:to-emerald-600/50 border border-cyan-500/40 hover:border-cyan-400 text-white font-semibold text-sm sm:text-base transition-all duration-300 group/btn"
            >
              <span>Explore Custom Development</span>
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
