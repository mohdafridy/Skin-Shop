"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug } from "@/data/products";
import { getComboBySlug } from "@/data/combos";
import { defaultZone } from "@/data/shipping";
import { getActivePaymentProvider } from "@/lib/payment";
import OrderSummary, { type OrderLine } from "@/components/checkout/OrderSummary";

type FormState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  billingSameAsShipping: boolean;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  deliveryMethodId: string;
};

const initialForm: FormState = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  billingSameAsShipping: true,
  billingAddress1: "",
  billingAddress2: "",
  billingCity: "",
  billingState: "",
  billingPostalCode: "",
  billingCountry: "India",
  deliveryMethodId: defaultZone.methods[0]?.id ?? "standard",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIA_PIN_PATTERN = /^\d{6}$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,15}$/;

function useOrderLines(): { lines: OrderLine[]; mode: "cart" | "buynow"; error: string | null } {
  const searchParams = useSearchParams();
  const { items } = useCart();
  const mode = searchParams.get("mode") === "buynow" ? "buynow" : "cart";

  if (mode === "buynow") {
    const type = searchParams.get("type");
    const slug = searchParams.get("slug");
    const qty = Math.max(1, Number(searchParams.get("qty")) || 1);

    if (type === "product" && slug) {
      const product = getProductBySlug(slug);
      if (!product) return { lines: [], mode, error: "We couldn't find that product." };
      return {
        lines: [
          {
            type: "product",
            slug: product.slug,
            name: product.shortName ?? product.name,
            image: product.image,
            price: product.price,
            currency: product.currency,
            quantity: qty,
          },
        ],
        mode,
        error: null,
      };
    }

    if (type === "combo" && slug) {
      const combo = getComboBySlug(slug);
      if (!combo) return { lines: [], mode, error: "We couldn't find that combo." };
      return {
        lines: [
          {
            type: "combo",
            slug: combo.slug,
            name: combo.name,
            image: combo.image,
            price: combo.price,
            currency: combo.currency,
            quantity: qty,
          },
        ],
        mode,
        error: null,
      };
    }

    return { lines: [], mode, error: "We couldn't find that item." };
  }

  return {
    lines: items.map((i) => ({
      type: i.type,
      slug: i.slug,
      name: i.name,
      image: i.image,
      price: i.price,
      currency: i.currency,
      quantity: i.quantity,
    })),
    mode,
    error: items.length === 0 ? "Your bag is empty." : null,
  };
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Enter a valid email address.";

  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  else if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = "Enter a valid phone number.";

  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";

  if (!form.address1.trim()) errors.address1 = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!form.postalCode.trim()) errors.postalCode = "PIN code is required.";
  else if (form.country.trim().toLowerCase() === "india" && !INDIA_PIN_PATTERN.test(form.postalCode.trim())) {
    errors.postalCode = "Enter a valid 6-digit PIN code.";
  }
  if (!form.country.trim()) errors.country = "Country is required.";

  if (!form.billingSameAsShipping) {
    if (!form.billingAddress1.trim()) errors.billingAddress1 = "Billing address is required.";
    if (!form.billingCity.trim()) errors.billingCity = "Billing city is required.";
    if (!form.billingState.trim()) errors.billingState = "Billing state is required.";
    if (!form.billingPostalCode.trim()) errors.billingPostalCode = "Billing PIN code is required.";
    else if (
      form.billingCountry.trim().toLowerCase() === "india" &&
      !INDIA_PIN_PATTERN.test(form.billingPostalCode.trim())
    ) {
      errors.billingPostalCode = "Enter a valid 6-digit PIN code.";
    }
    if (!form.billingCountry.trim()) errors.billingCountry = "Billing country is required.";
  }

  return errors;
}

export default function CheckoutClient() {
  const { lines, mode, error: linesError } = useOrderLines();
  const { couponCode, discount, applyCoupon, removeCoupon, clearCart } = useCart();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentPending, setPaymentPending] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currency = lines[0]?.currency ?? "INR";
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const effectiveDiscount = mode === "cart" ? discount : 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const result = applyCoupon(couponInput);
    if (!result.valid) {
      setCouponError(result.reason ?? "That code isn't valid.");
      return;
    }
    setCouponError(null);
    setCouponInput("");
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setSubmitting(true);
    const provider = getActivePaymentProvider();
    const result = await provider.initiate({
      orderNumber: "PENDING",
      amount: subtotal - effectiveDiscount,
      currency,
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
    });
    setSubmitting(false);

    if (result.status === "unavailable") {
      setPaymentPending(result.reason);
      return;
    }
    // A configured provider (redirect / client-side) would be handled here
    // once one exists. Nothing today reaches this branch.
  }

  if (linesError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">{linesError}</h1>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
        >
          Explore The Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:py-16">
      <h1 className="mb-2 font-display text-4xl text-ink">Checkout</h1>
      <p className="mb-10 text-sm text-walnut/70">
        {mode === "buynow" ? "Buy Now — checking out this item directly." : "Guest checkout — no account required."}
      </p>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={handlePlaceOrder} noValidate className="space-y-10">
          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Phone"
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                error={errors.phone}
                autoComplete="tel"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Customer</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                id="firstName"
                value={form.firstName}
                onChange={(v) => update("firstName", v)}
                error={errors.firstName}
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                id="lastName"
                value={form.lastName}
                onChange={(v) => update("lastName", v)}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Shipping Address</legend>
            <div className="grid gap-4">
              <Field
                label="Address line 1"
                id="address1"
                value={form.address1}
                onChange={(v) => update("address1", v)}
                error={errors.address1}
                autoComplete="address-line1"
              />
              <Field
                label="Address line 2"
                id="address2"
                required={false}
                value={form.address2}
                onChange={(v) => update("address2", v)}
                autoComplete="address-line2"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  id="city"
                  value={form.city}
                  onChange={(v) => update("city", v)}
                  error={errors.city}
                  autoComplete="address-level2"
                />
                <Field
                  label="State"
                  id="state"
                  value={form.state}
                  onChange={(v) => update("state", v)}
                  error={errors.state}
                  autoComplete="address-level1"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="PIN code"
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(v) => update("postalCode", v)}
                  error={errors.postalCode}
                  autoComplete="postal-code"
                />
                <Field
                  label="Country"
                  id="country"
                  value={form.country}
                  onChange={(v) => update("country", v)}
                  error={errors.country}
                  autoComplete="country-name"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Billing Address</legend>
            <label className="mb-4 flex items-center gap-2.5 text-sm text-walnut/80">
              <input
                type="checkbox"
                checked={form.billingSameAsShipping}
                onChange={(e) => update("billingSameAsShipping", e.target.checked)}
                className="h-[18px] w-[18px] rounded border-gold/40 text-burgundy focus:ring-burgundy"
              />
              Billing address same as shipping
            </label>

            {!form.billingSameAsShipping && (
              <div className="grid gap-4">
                <Field
                  label="Address line 1"
                  id="billingAddress1"
                  value={form.billingAddress1}
                  onChange={(v) => update("billingAddress1", v)}
                  error={errors.billingAddress1}
                />
                <Field
                  label="Address line 2"
                  id="billingAddress2"
                  required={false}
                  value={form.billingAddress2}
                  onChange={(v) => update("billingAddress2", v)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="City"
                    id="billingCity"
                    value={form.billingCity}
                    onChange={(v) => update("billingCity", v)}
                    error={errors.billingCity}
                  />
                  <Field
                    label="State"
                    id="billingState"
                    value={form.billingState}
                    onChange={(v) => update("billingState", v)}
                    error={errors.billingState}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="PIN code"
                    id="billingPostalCode"
                    value={form.billingPostalCode}
                    onChange={(v) => update("billingPostalCode", v)}
                    error={errors.billingPostalCode}
                  />
                  <Field
                    label="Country"
                    id="billingCountry"
                    value={form.billingCountry}
                    onChange={(v) => update("billingCountry", v)}
                    error={errors.billingCountry}
                  />
                </div>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Delivery Method</legend>
            <div className="space-y-2">
              {defaultZone.methods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-white/50 px-4 py-3.5 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethodId === method.id}
                      onChange={() => update("deliveryMethodId", method.id)}
                      className="h-[18px] w-[18px] text-burgundy focus:ring-burgundy"
                    />
                    <span>
                      <span className="block font-medium text-ink">{method.label}</span>
                      <span className="block text-xs text-walnut/60">{method.description}</span>
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-walnut/70">
                    {method.price === null ? "Calculated at checkout" : `₹${method.price}`}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {mode === "cart" && (
            <fieldset>
              <legend className="mb-4 font-display text-xl text-ink">Coupon</legend>
              {couponCode && discount > 0 ? (
                <div className="flex items-center justify-between rounded-full bg-olive/10 px-4 py-2 text-xs text-olive">
                  <span>
                    Code <span className="font-semibold">{couponCode}</span> applied
                  </span>
                  <button type="button" onClick={removeCoupon} className="underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="checkout-coupon" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="checkout-coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(null);
                    }}
                    placeholder="Coupon code"
                    className="w-full min-w-0 rounded-full border border-gold/30 bg-white/60 px-4 py-2.5 text-sm text-ink placeholder:text-walnut/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="flex-shrink-0 rounded-full border border-ink px-5 py-2.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-2 text-xs text-burgundy" role="alert">
                  {couponError}
                </p>
              )}
            </fieldset>
          )}

          <fieldset>
            <legend className="mb-4 font-display text-xl text-ink">Payment</legend>
            <div className="rounded-2xl border border-dashed border-gold/40 bg-sand/40 px-5 py-4 text-sm text-walnut/75">
              <p className="font-medium text-ink">Payment isn&apos;t connected yet</p>
              <p className="mt-1">
                This store is ready to accept payment once a provider (Razorpay, Stripe, or
                another approved gateway) is connected. No card details are collected here.
              </p>
            </div>
          </fieldset>

          {paymentPending && (
            <div
              role="status"
              className="rounded-2xl border border-burgundy/30 bg-burgundy/5 px-5 py-4 text-sm text-burgundy"
            >
              <p className="font-medium">We can&apos;t complete this order yet</p>
              <p className="mt-1 text-burgundy/90">{paymentPending}</p>
              <p className="mt-2 text-xs text-walnut/60">
                Your details above are still here — nothing was lost.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-burgundy px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
        </form>

        <div className="h-fit lg:sticky lg:top-28">
          <OrderSummary lines={lines} subtotal={subtotal} discount={effectiveDiscount} currency={currency} />
          {mode === "cart" && (
            <button
              type="button"
              onClick={clearCart}
              className="mt-4 text-xs text-walnut/50 underline-offset-2 hover:text-burgundy hover:underline"
            >
              Clear bag
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  required = true,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-burgundy ${
          error ? "border-burgundy" : "border-gold/30"
        }`}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-burgundy">
          {error}
        </span>
      )}
    </label>
  );
}
