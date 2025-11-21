"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateWithTag(tag: string, profile: string) {
  revalidateTag(tag, profile);
}
export default async function revalidate(path: string) {
  revalidatePath(path);
}
