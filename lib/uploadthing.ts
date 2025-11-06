import { UTApi, UTFile } from "uploadthing/server";

export const utapi = new UTApi();

export async function uploadThing(file: File, key: "profilePicture") {
    // Convert the browser File into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Wrap it in UTFile (needs a Uint8Array, filename, and metadata)
    const utFile = new UTFile([new Uint8Array(arrayBuffer)], file.name, {
        customId: key,
    });

    // Upload with UTApi
    const res = await utapi.uploadFiles(utFile);

    return res;
}
