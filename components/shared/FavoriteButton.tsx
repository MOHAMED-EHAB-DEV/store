"use client";

import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { sendGTMEvent } from "@next/third-parties/google";
import { ITemplate } from "@/lib/validations/template";

export default function FavoriteButton({ template }: { template: ITemplate }) {
  const { favoriteTemplates, toggleFavorite } = useUser();
  const isFavorite = favoriteTemplates?.some(
    (favTemplate: ITemplate) => favTemplate._id === template._id,
  );

  return (
    <Button
      type="button"
      className={`absolute top-3.5 right-3.5 ${
        isFavorite
          ? "bg-pink-500/25 text-pink-400 border-pink-500/40 shadow-md shadow-pink-500/20"
          : "bg-gray-900/70 text-gray-400 border-gray-700/60 hover:text-white hover:bg-gray-800 hover:border-gray-600"
      } backdrop-blur-md border transition-all duration-200 cursor-pointer z-20 rounded-full p-2 h-auto focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none`}
      aria-label={
        isFavorite
          ? `Remove ${template?.title || "template"} from favorites`
          : `Add ${template?.title || "template"} to favorites`
      }
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(template);
        sendGTMEvent({
          event: "template_favorite_toggle",
          template_id: template._id,
          template_title: template.title,
          is_favorite: !isFavorite,
        });
      }}
    >
      <Heart
        className={`size-4 transition-transform duration-200 ${
          isFavorite ? "text-pink-500 fill-pink-500 scale-110" : "text-gray-300"
        }`}
        isActive={isFavorite}
        aria-hidden="true"
      />
    </Button>
  );
}
