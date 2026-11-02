import { boringLinks, shopLinks, socialLinks } from "lib/constants";

const listItemClass =
  "mx-2.5 list-none pb-1.5 text-sm hover:underline max-md:mx-0";

function FooterLink({
  href,
  label,
  external = true,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a rel="noreferrer" href={href} target="_blank">
        {label}
      </a>
    );
  }

  return <a href={href}>{label}</a>;
}

function ShopList() {
  return (
    <ul className="block justify-center text-nowrap">
      {shopLinks.map((item) => (
        <li key={item} className={listItemClass}>
          <button
            type="button"
            className="uppercase cursor-pointer hover:underline"
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  );
}

function BoringList() {
  return (
    <ul className="block justify-center text-nowrap">
      {boringLinks.map((item) => (
        <li key={item.label} className={listItemClass}>
          <FooterLink href={item.href} label={item.label} />
        </li>
      ))}
    </ul>
  );
}

function SocialList() {
  return (
    <ul className="block justify-center text-nowrap">
      {socialLinks.map((item) => (
        <li key={item.label} className={listItemClass}>
          <FooterLink
            href={item.href}
            label={item.label}
            external={item.external}
          />
        </li>
      ))}
    </ul>
  );
}

const detailsSummaryClass =
  "cursor-pointer select-none py-2 font-bold flex items-center justify-between";

export default function Footer() {
  return (
    <footer
      id="footer"
      aria-label="footer"
      className="shrink-0 clear-both mx-auto my-0 h-1/4 max-w-sm max-md:mt-10 max-md:max-w-xs max-md:-translate-x-0 ease-out duration-300"
    >
      <div className="text-center leading-4 max-md:leading-none">
        <div className="block lg:hidden lg:invisible md:hidden md:invisible">
          <details className="my-2 text-sm uppercase">
            <summary className={detailsSummaryClass}>
              <h4 className="w-full text-center">Shops</h4>
              <span className="ml-3 text-xs">+</span>
            </summary>
            <div className="pb-2">
              <ShopList />
            </div>
          </details>

          <details className="my-2 text-sm uppercase">
            <summary className={detailsSummaryClass}>
              <h4 className="w-full text-center">Boring Stuff</h4>
              <span className="ml-3 text-xs">+</span>
            </summary>
            <div className="pb-2">
              <BoringList />
            </div>
          </details>

          <details className="my-2 text-sm uppercase">
            <summary className={detailsSummaryClass}>
              <h4 className="w-full text-center">Do Watch That</h4>
              <span className="ml-3 text-xs">+</span>
            </summary>
            <div className="pb-2">
              <SocialList />
            </div>
          </details>
        </div>

        <div className="flex flex-row place-content-around max-md:hidden max-md:invisible">
          <div className="my-5 text-sm uppercase">
            <h4 className="mt-1 select-none pb-1.5 font-bold">Shops</h4>
            <ShopList />
          </div>

          <div className="my-5 text-sm uppercase">
            <h4 className="mt-1 select-none pb-1.5 font-bold">Boring Stuff</h4>
            <BoringList />
          </div>

          <div className="my-5 text-sm uppercase">
            <h4 className="mt-1 select-none pb-1.5 font-bold">Do Watch That</h4>
            <SocialList />
          </div>
        </div>
      </div>
    </footer>
  );
}
