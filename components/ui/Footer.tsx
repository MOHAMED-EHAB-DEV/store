import Link from "next/link";
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
import { socialImgs } from "@/constants/assets";
import { FooterLinks } from "@/constants/navigation";

const BackToTop = dynamic(() => import("@/components/ui/BackToTop"));

const Footer = () => {
  return (
    <footer className="w-full text-white bg-transparent border-t border-white/5 relative z-10 pb-16 sm:pb-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Socials */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-2xl font-bold font-paras tracking-tight">MHD Store</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Production-ready Next.js & React templates engineered for builders and creative entrepreneurs.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 w-fit text-xs text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All Systems Operational</span>
            </div>

            <div className="flex gap-3 mt-1">
              {socialImgs.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow on ${social.name}`}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/15 transition-all"
                >
                  <social.Icon aria-hidden="true" className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer Navigation">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4 font-mono">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {FooterLinks.map(({ id, text, link }) => (
                <li key={id}>
                  <Link
                    href={link}
                    aria-label={`${text} page footer link`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Custom Services & Templates */}
          <nav aria-label="Footer Services">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4 font-mono">
              Services & Products
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/custom-development"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Custom Development
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Premium Access
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Customer Support & Help
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal & Back To Top */}
          <div className="flex flex-col justify-between">
            <nav aria-label="Footer Legal">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4 font-mono">
                Legal
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/terms-of-service"
                    aria-label="Terms of Service page link"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    aria-label="Privacy Policy page link"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-6">
              <BackToTop />
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Mohammed Ehab (MHD Store). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
