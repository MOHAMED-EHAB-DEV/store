export interface IThumbnailObject {
  url: string;
  gradientColors?: string[];
  gradientStyle?: string;
}

export type TemplateThumbnailType = string | IThumbnailObject | undefined | null;

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const generateGradientStyle = (
  colors: string[],
  angle = 135
): string => {
  if (!colors || colors.length === 0) {
    return "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.3) 50%, rgba(6,182,212,0.3) 100%)";
  }
  if (colors.length === 1) {
    return `linear-gradient(${angle}deg, ${colors[0]} 0%, rgba(13,15,25,0.8) 100%)`;
  }
  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
};

export function getThumbnailData(thumbnail: TemplateThumbnailType): {
  url: string;
  gradientColors: string[];
  gradientStyle: string;
} {
  if (!thumbnail) {
    return {
      url: "",
      gradientColors: [],
      gradientStyle: generateGradientStyle([]),
    };
  }

  if (typeof thumbnail === "string") {
    return {
      url: thumbnail,
      gradientColors: [],
      gradientStyle: generateGradientStyle([]),
    };
  }

  const colors = thumbnail.gradientColors || [];
  const style = thumbnail.gradientStyle || generateGradientStyle(colors);

  return {
    url: thumbnail.url || "",
    gradientColors: colors,
    gradientStyle: style,
  };
}

const MAX_WIDTH = 1920;

export const resizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                {
                  type: "image/webp",
                  lastModified: Date.now(),
                }
              );
              resolve(resizedFile);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Client-side color extraction from Image element using 2D canvas sampling.
 * Samples the 4 corners, center, and side edges to construct a tailored gradient.
 */
export const extractColorsFromImageElement = (
  img: HTMLImageElement
): { gradientColors: string[]; gradientStyle: string } => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 3;
    canvas.height = 3;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return {
        gradientColors: [],
        gradientStyle: generateGradientStyle([]),
      };
    }

    ctx.drawImage(img, 0, 0, 3, 3);
    const pixelData = ctx.getImageData(0, 0, 3, 3).data;

    const sampleHex = (index: number) => {
      const offset = index * 4;
      return rgbToHex(
        pixelData[offset],
        pixelData[offset + 1],
        pixelData[offset + 2]
      );
    };

    // Sample top-left, top-right, center, bottom-left, bottom-right
    const colors = [
      sampleHex(0), // Top-left
      sampleHex(2), // Top-right
      sampleHex(4), // Center
      sampleHex(6), // Bottom-left
      sampleHex(8), // Bottom-right
    ];

    const uniqueColors = Array.from(new Set(colors)).slice(0, 4);
    const gradientStyle = generateGradientStyle(uniqueColors);

    return {
      gradientColors: uniqueColors,
      gradientStyle,
    };
  } catch (err) {
    console.warn("Client color extraction failed:", err);
    return {
      gradientColors: [],
      gradientStyle: generateGradientStyle([]),
    };
  }
};
