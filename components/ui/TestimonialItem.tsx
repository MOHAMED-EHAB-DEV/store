import Image from "next/image";
import { Star } from "@/components/ui/svgs/Icons";
import { FC } from "react";

interface TestimonialItemProps {
  avatar: string;
  name: string;
  rating: Number;
  text: string;
}

const TestimonialItem: FC<TestimonialItemProps> = ({
  avatar,
  name,
  rating,
  text,
}) => {
  return (
    <div className="relative w-fit h-fit p-[2px] rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-gradient">
      <div
        className="flex flex-col justify-between items-center gap-5 w-80 h-fit 
        rounded-2xl p-6 
        bg-gradient-to-b from-[#0b0f1a]/95 to-[#111827]/95 backdrop-blur-lg
        border border-white/10 shadow-lg
        hover:scale-105 hover:shadow-2xl transition-all duration-500"
      >
        {/* Avatar + Name + Stars */}
        <div className="flex gap-4 items-center w-full">
          {/* Avatar with gradient ring */}
          <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">
            <div className="w-full h-full rounded-full overflow-hidden bg-black">
              <Image src={avatar} alt={name} width={56} height={56} />
            </div>
          </div>

          {/* Name & Stars */}
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">
              {name}
            </span>
            <div className="flex gap-1 text-yellow-400">
              {[...Array(rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-current animate-twinkle"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial Text */}
        <p className="text-gray-200 text-sm leading-relaxed italic text-center">
          “{text}”
        </p>
      </div>
    </div>
  );
};

export default TestimonialItem;