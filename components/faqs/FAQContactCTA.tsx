"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQContactCTA() {
    return (
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
            <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
                <p className="text-muted-foreground mb-6">
                    Our support team is here to help! Reach out to us and we'll get back to you as soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/50 transition-all duration-500">
                        <Link href="/support">Contact Support</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all duration-300">
                        <Link href="mailto:support@mystore.com">Email Us</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
