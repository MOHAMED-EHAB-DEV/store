import { getCategories } from "@/static/categories";
import { ICategory } from "@/lib/validations/category";
import CategoriesGrid from "./CategoriesGrid";

const CategoriesSection = async () => {
  const categories: ICategory[] = await getCategories();

  return (
    <section
      className="w-full py-20 relative overflow-hidden"
      aria-labelledby="categories-heading"
    >
      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-18 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Section Headline */}
          <h2
            id="categories-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-paras tracking-tight leading-tight"
          >
            Architected for Every{" "}
            <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Digital Foundation
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Explore purpose-built templates categorized by architecture, framework,
            and business archetype. Strict TypeScript schemas, sub-second loads, and zero technical debt.
          </p>
        </div>

        {/* Grid Component */}
        <CategoriesGrid categories={categories} />
      </div>
    </section>
  );
};

export default CategoriesSection;
