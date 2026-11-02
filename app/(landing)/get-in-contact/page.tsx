import { ContactForm } from "components/contact/contact-form";
import { FaqAccordion } from "components/contact/faq-accordion";
import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import {
  contactIntro,
  customerServiceHours,
  faqSections,
} from "lib/contact/faq-content";
import { getLandingPageData } from "lib/get-landing-page";

export const metadata = {
  title: "Get in Contact",
  description: "FAQ and contact form for April Coffee Roasters.",
};

export default async function GetInContactPage() {
  const { headerLinks, footerLinks } = await getLandingPageData();

  return (
    <>
      <Header navItems={headerLinks} />

      <main
        role="main"
        id="mainContent"
        className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden"
      >
        <div className="mx-5 flex w-full min-w-0 max-w-3xl flex-col py-10 md:py-14">
          <header className="mb-10 text-center">
            <h1 className="type-h1 text-2xl uppercase md:text-3xl">
              FAQ &amp;
              <br />
              Contact Form
            </h1>
            <p className="type-text mx-auto mt-5 max-w-xl text-[13px] leading-[18px]">
              {contactIntro}
            </p>
          </header>

          <FaqAccordion sections={faqSections} />

          <section className="mt-12 border-t border-[#d7d7d7] pt-10">
            <p className="text-[13px] leading-[18px]">
              <strong className="uppercase">
                {customerServiceHours.title}
              </strong>
              <br />
              {customerServiceHours.open}
              <br />
              {customerServiceHours.closed}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] leading-[18px]">
              {customerServiceHours.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="contact-form-heading">
            <h2
              id="contact-form-heading"
              className="type-h2 mb-5 text-sm uppercase"
            >
              Contact form
            </h2>
            <ContactForm />
          </section>
        </div>
      </main>

      <Footer links={footerLinks} />
    </>
  );
}
