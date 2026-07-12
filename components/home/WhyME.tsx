"use client";

import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";

const WhyME = () => {
  return (
    <div className="flex flex-col mx-auto md:flex-row items-center justify-center w-full h-full px-5 gap-28">
      <div className="flex flex-col gap-4 md:w-1/2 w-full h-full md:h-1/2">
        <h2 className="md:text-4xl font-bold text-2xl font-paras">
          Stop stressing over your business website.
        </h2>
        <p className="text-secondary text-base md:text-lg">
          Building from scratch takes months. Start with a premium template today — and if you need it tailored to your brand, backend, or business logic, I&apos;ll build that part too, in days not months.
        </p>
        <ul className="text-secondary text-base md:text-lg list-d built to engage and convertisc pl-5 space-y-1">
          <li>
            - Professionally designed, conversion‑ready layouts built to engage
            and convert.
          </li>
          <li>- Fully responsive—optimized for mobile, tablet, and desktop.</li>
          <li>- Customizable without the typical builder constraints.</li>
        </ul>
        <span className="font-bold text-xl tracking-wide md:text-2xl font-paras">
          Build smarter. Launch sooner.
        </span>
      </div>
      <div className="flex items-center justify-center w-full md:w-1/4">
        <Image
          src={anyImgUrl("https://res.cloudinary.com/ju8d58lo/image/upload/v1783873413/cursor_bu7iuh.webp", {
            width: 660,
            quality: 100
            // original: true,
          })}
          alt="Cursor Icon"
          width={330}
          height={330}
          unoptimized
          className="w-1/2 md:w-full"
        />
      </div>
    </div>
  );
};

export default WhyME;
