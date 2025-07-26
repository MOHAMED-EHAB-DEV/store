"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateWithTag(tag: string) {
  revalidateTag(tag);
}
export default async function revalidate(path: string) {
  revalidatePath(path);
}
