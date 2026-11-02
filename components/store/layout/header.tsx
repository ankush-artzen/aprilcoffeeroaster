"use client";

import CustomerAccountLink from "components/store/layout/customer-account-link";
import { defaultTriFergNav } from "lib/constants";
import type { LandingLink } from "lib/landing-types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const defaultNavItems: LandingLink[] = defaultTriFergNav.map((item) => ({
  label: item.title,
  href: item.href,
  external: Boolean(item.external),
}));

const mobileLinkClass =
  "type-h2 block py-2 text-[14.4px] leading-4.5 no-underline text-standard-grey";

function menuItemTestId(label: string) {
  return `menu-item-${label.toLowerCase()}`;
}

type HeaderProps = {
  landing?: boolean;
  navItems?: LandingLink[];
};

export default function Header({
  landing = false,
  navItems = defaultNavItems,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuElevated, setMenuElevated] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      setMenuElevated(true);
    }
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleMenuTransitionEnd(
    event: React.TransitionEvent<HTMLElement>,
  ) {
    if (event.propertyName !== "transform" || menuOpen) {
      return;
    }
    setMenuElevated(false);
  }

  return (
    <>
      <header
        aria-label="header"
        className={`flex min-h-20 justify-center uppercase md:min-h-24 ${
          landing ? "md:invisible md:hidden" : ""
        } ${menuElevated ? "relative z-30 bg-white" : ""}`}
      >
        <div className="mx-5 mt-1.5 mb-2.5 flex w-full max-w-5xl items-center md:mt-3.5 md:mb-0 md:items-start">
          <Link href="/" prefetch={false} aria-label="black-april-logo">
            <div
  className="relative block h-16 w-54  transition-opacity duration-150 ease-in-out hover:opacity-25 md:bottom-[12px] md:h-[82px] md:w-[250px]"
  // className="relative block h-16 w-54 transition-opacity duration-150 ease-in-out hover:opacity-25 md:bottom-[12px] md:h-[71px] md:w-48"
              aria-label="logo"
            >
              <Image
                src="/images/april-website-logo-three.svg"
                alt="Black April Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>
          <nav className="header-main-nav ml-auto flex max-md:invisible max-md:hidden">
            {navItems.map((item) => (
              <h2 key={item.label} className="header-nav-item type-h2">
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} prefetch={false}>
                    {item.label}
                  </Link>
                )}
              </h2>
            ))}
            {landing ? null : (
              <h2 className="header-nav-item type-h2">
                <CustomerAccountLink />
              </h2>
            )}
          </nav>
          <button
            type="button"
            id="mobile-menu-btn"
            className={`ml-auto pl-2.5 md:hidden ${menuElevated ? "relative z-10" : ""}`}
            aria-label="mobile-menu-btn"
            data-menu-open={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <div
              className="group right-0 mr-0 flex h-5 flex-col"
              aria-label="hamburger-button"
            >
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition duration-200 ease-in-out group-hover:opacity-100 ${
                  menuOpen
                    ? "translate-y-[5.5px] rotate-45 transform"
                    : ""
                }`}
              />
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition duration-200 ease-in-out group-hover:opacity-100 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition duration-200 ease-in-out group-hover:opacity-100 ${
                  menuOpen
                    ? "-translate-y-[8.5px] -rotate-45 transform"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <nav
        id="mobile-menu"
        aria-label="mobile-menu"
        aria-hidden={!menuOpen}
        onTransitionEnd={handleMenuTransitionEnd}
        className={`
          fixed
          top-20
          right-0
          bottom-0
          left-0
          z-20
          overflow-hidden
          bg-white
          px-5
          pt-4
          uppercase
          transition-transform
          duration-300
          ease-out
          will-change-transform
          md:hidden
          ${menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"}
        `}
      >
        <ul>
          {navItems.map((item) => (
            <li key={item.label} data-testid={menuItemTestId(item.label)}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  prefetch={false}
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          {landing ? null : (
            <li data-testid="menu-item-login / my account">
              <CustomerAccountLink
                className={mobileLinkClass}
                onClick={closeMenu}
              />
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
