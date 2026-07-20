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
      className={`absolute top-4 right-4 ${
        isFavorite ? "bg-pink-100" : "bg-white/75"
      } transition hover:bg-white/90 cursor-pointer z-20 rounded-full p-2 shadow-md`}
      aria-label="Toggle Favorite"
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
        className={`size-5 ${isFavorite ? "text-pink-500" : "text-gray-400"}`}
        isActive={isFavorite}
      />
    </Button>
  );
}
