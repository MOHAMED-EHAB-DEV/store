import User from "@/lib/models/User";

/**
 * Returns true if the user has purchased the provided template.
 * Assumes `User` is a Mongoose model and `purchasedTemplates` is an array of ObjectId strings.
 */
export async function userHasPurchased(userId: string, templateId: string): Promise<boolean> {
  try {
    if (!userId || !templateId) return false;

    // Simple query: check user document has the templateId in purchasedTemplates array
    const user = await User.findOne({
      _id: userId,
      purchasedTemplates: templateId,
    }).select("_id").lean();

    return !!user;
  } catch (err) {
    console.error(`Error while checking purchase for user ${userId}, template ${templateId}:`, err);
    return false;
  }
}
