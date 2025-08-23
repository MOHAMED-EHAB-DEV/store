import sharp from "sharp";
import fs from "fs";

async function generateBlurDataURL() {
    const imageBuffer = fs.readFileSync("./public/assets/images/Preview.webp");

    const smallBuffer = await sharp(imageBuffer)
        .resize(8, 8) // tiny size for blur
        .toFormat("jpeg")
        .toBuffer();

    const base64 = smallBuffer.toString("base64");
    const blurDataURL = `data:image/jpeg;base64,${base64}`;

    console.log(blurDataURL);
}

generateBlurDataURL();
