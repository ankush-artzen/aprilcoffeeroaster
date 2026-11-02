"use client";

import { contactFormNotice } from "lib/contact/faq-content";
import { FormEvent, useState } from "react";

const inputClass =
  "mt-1.5 h-[48px] w-full border border-[#d7d7d7] bg-white px-4 text-[14px] outline-none focus:border-black";

const textareaClass =
  "mt-1.5 w-full border border-[#d7d7d7] bg-white px-4 py-3 text-[14px] outline-none focus:border-black";

const labelClass = "type-text2 block text-[13px] uppercase";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(formData.get("fullName") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          orderNumber: String(formData.get("orderNumber") ?? "").trim(),
          message: String(formData.get("message") ?? "").trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          payload?.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name<sup>*</sup>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          placeholder="Enter your full name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email<sup>*</sup>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your mail"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="orderNumber" className={labelClass}>
          Order Number<sup>*</sup>
        </label>
        <input
          id="orderNumber"
          name="orderNumber"
          type="text"
          required
          placeholder="Enter your order number (if applicable)"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message<sup>*</sup>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Enter your message"
          className={textareaClass}
        />
      </div>

      <p className="text-[13px] leading-[18px] text-neutral-600">
        {contactFormNotice}
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-brand h-12 w-full border-[2pt] text-sm font-bold uppercase tracking-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit"}
      </button>

      {status === "success" ? (
        <p className="type-text2 text-[13px] uppercase text-standard-grey">
          Thank you — your message has been sent.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p className="text-[13px] leading-[18px] text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
