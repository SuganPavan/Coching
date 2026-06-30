"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  Upload,
  X,
  Copy,
  Check,
  ShieldCheck,
  User,
  Phone,
  IndianRupee,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------
// CONFIG  -- edit these for your academy
// ---------------------------------------------------------------
const UPI_ID = "brightfutureacademy@upi";
const ACADEMY_NAME = "Bright Future Academy";
const SUPPORT_PHONE = "+91 76950 42440";
const SUPPORT_PHONE_HREF = "tel:+917695042440";

// ---------------------------------------------------------------
// TO USE YOUR OWN QR IMAGE:
//   1. Save your QR image as:  /public/images/upi-qr.png
//   2. Set USE_IMAGE_QR = true  (line below)
// ---------------------------------------------------------------
const USE_IMAGE_QR = true;
const QR_IMAGE_PATH = "/images/upi-qr.png";
// ---------------------------------------------------------------

type PageState = "details" | "qr" | "confirm" | "success";

interface UserDetails {
  name: string;
  phone: string;
  studentClass: string;
  admissionNumber: string;
  amount: string;
  userType: "existing" | "new";
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function fmtINR(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

function inputCls(hasError: boolean) {
  return (
    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors " +
    "focus:ring-2 focus:ring-navy-700/30 " +
    (hasError
      ? "border-destructive bg-destructive/5 focus:border-destructive"
      : "border-input bg-background focus:border-navy-700")
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

// ---------------------------------------------------------------
// Shared layout pieces
// ---------------------------------------------------------------
function PageHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-border">
      <div className="mx-auto max-w-3xl flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-700 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-navy-700">{ACADEMY_NAME}</span>
            <span className="block text-[10px] text-muted-foreground">Building Strong Foundations</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </Link>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="mt-12 border-t border-border py-5 text-center text-xs text-muted-foreground">
      {"(c) "}
      {new Date().getFullYear()}
      {" "}
      {ACADEMY_NAME}
      {". All rights reserved."}
    </footer>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const labels = ["Enter Details", "Scan & Pay", "Confirm"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {labels.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors " +
                  (done
                    ? "bg-navy-700 border-navy-700 text-white"
                    : active
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-border text-muted-foreground")
                }
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span
                className={
                  "mt-1 text-[10px] font-medium whitespace-nowrap " +
                  (active
                    ? "text-orange-500"
                    : done
                    ? "text-navy-700"
                    : "text-muted-foreground")
                }
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={
                  "h-0.5 w-12 sm:w-20 mx-1 mb-4 " +
                  (done ? "bg-navy-700" : "bg-border")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------
// QR code: generated SVG (used when USE_IMAGE_QR = false)
// ---------------------------------------------------------------
function GeneratedQR({ value }: { value: string }) {
  const size = 180;
  const cells = 21;
  const cs = size / cells;
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (i: number) => ((seed * (i + 1) * 2654435761) >>> 0) % 2 === 0;

  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if (
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7)
      ) {
        const border =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= cells - 7 &&
            (r === cells - 7 || r === cells - 1 || c === 0 || c === 6)) ||
          (c >= cells - 7 &&
            (c === cells - 7 || c === cells - 1 || r === 0 || r === 6));
        const inner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4);
        return border || inner;
      }
      return rand(r * cells + c);
    })
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={"0 0 " + size + " " + size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill="white" />
      {grid.map((row, ri) =>
        row.map((on, ci) =>
          on ? (
            <rect
              key={ri + "-" + ci}
              x={ci * cs}
              y={ri * cs}
              width={cs}
              height={cs}
              fill="#172e4b"
            />
          ) : null
        )
      )}
      <rect x={72} y={72} width={36} height={36} rx={4} fill="white" />
      <text
        x={90}
        y={94}
        textAnchor="middle"
        fontSize="8"
        fill="#f5870f"
        fontWeight="bold"
      >
        UPI
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------
// STEP 1 - Details form (open to ALL users)
// ---------------------------------------------------------------
function DetailsView({ onNext }: { onNext: (d: UserDetails) => void }) {
  const [userType, setUserType] = useState<"existing" | "new">("existing");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErr = (key: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!studentClass.trim()) e.studentClass = "Class / course is required";
    if (userType === "existing" && !admissionNumber.trim())
      e.admissionNumber = "Admission number is required for existing students";
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt < 1) e.amount = "Enter a valid amount";
    return e;
  };

  const handleContinue = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ name, phone, studentClass, admissionNumber, amount, userType });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Steps current={1} />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-navy-700">Pay Fees Online</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in your details below to proceed to payment.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">

          {/* Who are you */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">I am a</p>
            <div className="grid grid-cols-2 gap-3">
              {(["existing", "new"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setUserType(t)}
                  className={
                    "rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors " +
                    (userType === t
                      ? "border-navy-700 bg-navy-700 text-white"
                      : "border-border bg-white text-foreground hover:border-navy-400")
                  }
                >
                  {t === "existing" ? "Existing Student" : "New / Walk-in"}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-navy-700" />
              Full Name <span className="text-destructive ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); clearErr("name"); }}
              className={inputCls(!!errors.name)}
              placeholder="Enter your full name"
            />
            <ErrMsg msg={errors.name} />
          </div>

          {/* Mobile */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Phone className="h-3.5 w-3.5 text-navy-700" />
              Mobile Number <span className="text-destructive ml-0.5">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                clearErr("phone");
              }}
              className={inputCls(!!errors.phone)}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            <ErrMsg msg={errors.phone} />
          </div>

          {/* Class */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <BookOpen className="h-3.5 w-3.5 text-navy-700" />
              Class / Course <span className="text-destructive ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStudentClass(e.target.value); clearErr("studentClass"); }}
              className={inputCls(!!errors.studentClass)}
              placeholder="e.g. XII Science, JEE Batch, NEET Foundation"
            />
            <ErrMsg msg={errors.studentClass} />
          </div>

          {/* Admission number - existing students only */}
          {userType === "existing" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Admission Number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAdmissionNumber(e.target.value); clearErr("admissionNumber"); }}
                className={inputCls(!!errors.admissionNumber)}
                placeholder="e.g. ADM/2024/0042"
              />
              <ErrMsg msg={errors.admissionNumber} />
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <IndianRupee className="h-3.5 w-3.5 text-navy-700" />
              Amount to Pay <span className="text-destructive ml-0.5">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">
                Rs.
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAmount(e.target.value); clearErr("amount"); }}
                className={inputCls(!!errors.amount) + " pl-10"}
                placeholder="Enter amount"
                min={1}
              />
            </div>
            <ErrMsg msg={errors.amount} />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-navy-800 active:scale-95"
          >
            Continue to Payment
          </button>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}

// ---------------------------------------------------------------
// STEP 2 - QR code with student details alongside
// ---------------------------------------------------------------
function QRView({
  details,
  copied,
  onCopy,
  onPaid,
  onBack,
}: {
  details: UserDetails;
  copied: boolean;
  onCopy: () => void;
  onPaid: () => void;
  onBack: () => void;
}) {
  const upiLink =
    "upi://pay?pa=" +
    UPI_ID +
    "&pn=" +
    encodeURIComponent(ACADEMY_NAME) +
    "&am=" +
    details.amount +
    "&cu=INR&tn=" +
    encodeURIComponent("Fee: " + details.name);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Steps current={2} />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-navy-700">Scan and Pay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan the QR code using any UPI app and pay the exact amount shown.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* Left - Payment summary */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-navy-700 uppercase tracking-wide">
              Your Payment Details
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold text-foreground">{details.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium">{details.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Class / Course</span>
                <span className="font-medium">{details.studentClass}</span>
              </div>
              {details.userType === "existing" && details.admissionNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Admission No.</span>
                  <span className="font-medium">{details.admissionNumber}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Amount to Pay</span>
                <span className="text-xl font-bold text-orange-500">
                  {fmtINR(Number(details.amount))}
                </span>
              </div>
            </div>

            {/* UPI ID copy row */}
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Pay to UPI ID</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-sm font-semibold text-navy-700 break-all">
                  {UPI_ID}
                </span>
                <button
                  onClick={onCopy}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:bg-secondary transition-colors"
                  title="Copy UPI ID"
                >
                  {copied
                    ? <Check className="h-4 w-4 text-green-600" />
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {copied && (
                <p className="mt-1 text-xs text-green-600 font-medium">Copied!</p>
              )}
            </div>

            <button
              type="button"
              onClick={onBack}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit Details
            </button>
          </div>

          {/* Right - QR */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold text-navy-700 uppercase tracking-wide self-start">
              Scan QR Code
            </h2>

            <div className="rounded-2xl border-4 border-navy-700 bg-white p-3 shadow-inner">
              {USE_IMAGE_QR ? (
                // Replace with your real QR - set USE_IMAGE_QR=true and place image at /public/images/upi-qr.png
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={QR_IMAGE_PATH}
                  alt="UPI QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
              ) : (
                <GeneratedQR value={upiLink} />
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground px-2">
              Open PhonePe, GPay, Paytm or any UPI app and scan
            </p>

            <ol className="w-full space-y-2 text-sm text-muted-foreground">
              {[
                "Scan the QR code above",
                "Pay exactly " + fmtINR(Number(details.amount)),
                "Note the UTR / transaction ID from your app",
                "Click the button below to confirm payment",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-700 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={onPaid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-orange-600 active:scale-95"
            >
              <ShieldCheck className="h-5 w-5" />
              I Have Paid
            </button>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                Verified UPI
              </span>
            </div>
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}

// ---------------------------------------------------------------
// STEP 3 - Confirm payment
// ---------------------------------------------------------------
function ConfirmView({
  details,
  onBack,
  onSuccess,
}: {
  details: UserDetails;
  onBack: () => void;
  onSuccess: (utr: string) => void;
}) {
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const clearErr = (key: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    clearErr("screenshot");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setScreenshot(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!utr.trim()) errs.utr = "Enter UTR / Transaction ID";
    if (!screenshot) errs.screenshot = "Upload payment screenshot";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess(utr.trim());
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Steps current={3} />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-navy-700">Confirm Payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide your transaction ID and screenshot for verification.
          </p>
        </div>

        {/* Summary banner */}
        <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-700 truncate">{details.name}</p>
            <p className="text-xs text-orange-600">
              {details.studentClass}
              {details.admissionNumber ? " | " + details.admissionNumber : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-orange-600">
              {fmtINR(Number(details.amount))}
            </p>
            <p className="text-xs text-orange-500">Amount Paid</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          {/* Read-only pre-filled fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Name
              </label>
              <div className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-foreground truncate">
                {details.name}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mobile
              </label>
              <div className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
                {details.phone}
              </div>
            </div>
          </div>

          {/* UTR */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              UTR / Transaction ID <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={utr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setUtr(e.target.value); clearErr("utr"); }}
              className={inputCls(!!errors.utr)}
              placeholder="12-digit UPI reference number"
            />
            <ErrMsg msg={errors.utr} />
            <p className="mt-1 text-xs text-muted-foreground">
              Find this in your UPI app under transaction details.
            </p>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Payment Screenshot <span className="text-destructive">*</span>
            </label>

            {preview ? (
              <div className="relative rounded-xl border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Payment screenshot"
                  className="max-h-48 w-full object-contain bg-secondary"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow border border-border text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="py-2 text-center text-xs text-muted-foreground bg-secondary/50">
                  {screenshot?.name}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors " +
                  (errors.screenshot
                    ? "border-destructive bg-destructive/5"
                    : "border-border hover:border-navy-400 hover:bg-secondary/40")
                }
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-navy-700">Click to upload</span>
                  {" screenshot"}
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG up to 5 MB</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <ErrMsg msg={errors.screenshot} />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-700 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      <PageFooter />
    </div>
  );
}

// ---------------------------------------------------------------
// SUCCESS screen
// ---------------------------------------------------------------
function SuccessView({ details, utr }: { details: UserDetails; utr: string }) {
  const rows = [
    { label: "Name", value: details.name },
    { label: "Mobile", value: details.phone },
    { label: "Class", value: details.studentClass },
    ...(details.admissionNumber
      ? [{ label: "Admission No.", value: details.admissionNumber }]
      : []),
    { label: "Amount", value: fmtINR(Number(details.amount)) },
    { label: "UTR / Txn ID", value: utr },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-4 border-green-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-navy-700 mb-3">
          Payment Request Submitted!
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Your payment has been submitted for verification. Our team will update
          your records within{" "}
          <span className="font-medium text-foreground">24 working hours</span>.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          {"For queries call "}
          <a
            href={SUPPORT_PHONE_HREF}
            className="text-navy-700 font-medium hover:underline"
          >
            {SUPPORT_PHONE}
          </a>
        </p>

        <div className="w-full rounded-xl border border-border bg-card p-5 text-left mb-8 space-y-2.5">
          <h2 className="text-sm font-semibold text-navy-700 mb-3">
            Submission Summary
          </h2>
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm gap-4">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-medium text-foreground text-right break-all">{value}</span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-8 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </Link>
      </main>
      <PageFooter />
    </div>
  );
}

// ---------------------------------------------------------------
// ROOT - state machine
// ---------------------------------------------------------------
export default function PayFeesPage() {
  const [page, setPage] = useState<PageState>("details");
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState("");

  const copyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  if (page === "details") {
    return (
      <DetailsView
        onNext={(d) => {
          setDetails(d);
          setPage("qr");
        }}
      />
    );
  }

  if (page === "qr" && details) {
    return (
      <QRView
        details={details}
        copied={copied}
        onCopy={copyUPI}
        onPaid={() => setPage("confirm")}
        onBack={() => setPage("details")}
      />
    );
  }

  if (page === "confirm" && details) {
    return (
      <ConfirmView
        details={details}
        onBack={() => setPage("qr")}
        onSuccess={(submittedUtr) => {
          setUtr(submittedUtr);
          setPage("success");
        }}
      />
    );
  }

  if (page === "success" && details) {
    return <SuccessView details={details} utr={utr} />;
  }

  return null;
}
