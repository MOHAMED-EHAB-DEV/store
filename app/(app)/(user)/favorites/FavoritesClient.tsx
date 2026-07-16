"use client";

import Template from "@/components/shared/Template";
import Loader from "@/components/ui/Loader";
import { useUserStore } from "@/store/useUserStore";

const FavoritesClient = () => {
  const { favoriteTemplates } = useUserStore();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5`}>
      {favoriteTemplates.length === 0 ? (
        <div className="col-span-full text-center">
          <Loader />
        </div>
      ) : (
        favoriteTemplates.map((template) => (
          <Template
            key={template?._id! as string}
            template={template}
          />
        ))
      )}
    </div>
  );
};
export default FavoritesClient;
