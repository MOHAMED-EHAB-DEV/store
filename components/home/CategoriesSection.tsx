import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/static/categories";
import { ICategory } from "@/types";
import CategoriesCarousel from "./CategoriesCarousel";

const CategoriesSection = async () => {
  const categories: ICategory[] = await getCategories();
  
  // Filter out categories with 0 templates
  const activeCategories = categories;

  if (!activeCategories || activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 relative overflow-hidden" aria-labelledby="categories-heading">
      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Badge className="mb-6 bg-linear-to-r from-blue-500 to-teal-500 text-white border-none px-6 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
            Browse Categories
          </Badge>
          <h2 id="categories-heading" className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 font-paras leading-none tracking-tight">
            Find the Perfect{" "}
            <span className="relative">
              Fit
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-blue-500/20 via-teal-500/20 to-cyan-500/20 blur-md rounded-lg"
              />
            </span>
          </h2>
          <p className="text-medium-contrast text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
            Explore our templates by category to quickly find exactly what you need for your next project.
          </p>
        </div>

        {/* Carousel */}
        <CategoriesCarousel categories={activeCategories} />
      </div>
    </section>
  );
};

export default CategoriesSection;
