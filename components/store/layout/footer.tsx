import { socialLinks } from "lib/constants";
import type { LandingLink } from "lib/landing-types";
import Link from "next/link";

type FooterProps = {
  links?: LandingLink[];
};

export default function Footer({ links = socialLinks }: FooterProps) {
  const footerLinks = links;
  return (
    <footer
      aria-label="footer"
      className="mx-5 block max-h-44 justify-center pt-6 uppercase md:flex md:max-h-none md:pt-4"
    >
      <div className="w-full max-w-5xl pb-2 md:pb-8">
        <ul className="grid grid-cols-2 justify-center type-text2 md:flex md:text-sm">
          {footerLinks.map((item, index) => (
            <li
              key={index}
              className="flex w-full justify-center p-0 pb-3 md:w-auto md:px-3 md:pb-0"
            >
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="text-standard-grey outline outline-[2pt] outline-transparent outline-offset-2 transition-[outline-color,color] duration-150 ease-in-out hover:outline-hover-frame active:text-active active:outline-transparent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
