import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { socialImgs, NavigationLinks } from '@/constants';

const Footer = () => {
  return (
    <footer className="w-full bg-dark text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-secondary">
              Premium Templates for creative entrepreneurs
            </p>
            <div className="flex gap-4">
              {socialImgs.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-secondary hover:text-white transition"
                >
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="flex flex-col gap-2">
              {NavigationLinks.map(({ id, text, link }) => (
                <li key={id}>
                  <Link href={link} className="text-secondary hover:text-white transition">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/terms-of-service" className="text-secondary hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-secondary hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-secondary">
          <p>
            Copyright &copy; {new Date().getFullYear()} Mohammed Ehab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
