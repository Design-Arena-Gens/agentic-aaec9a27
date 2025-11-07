"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type MessageRole = "assistant" | "user";

type ChatMessage = {
  id: number;
  role: MessageRole;
  content: string;
};

type ServiceGuide = {
  id: string;
  keywords: string[];
  steps: string[];
  suggestions: string[];
  reassurance?: string;
};

const closingLine =
  "धन्यवाद! 🙏 Aapka apna VIKAS CSC – Vikas ke sath aapke vikas ki baat.";

const serviceGuides: ServiceGuide[] = [
  {
    id: "pension",
    keywords: ["pension", "life certificate", "dlc", "sparsh", "jeevan pramaan"],
    steps: [
      "Apni PPO number, Aadhaar card, bank passbook aur recent passport size photo ready rakhiye.",
      "VIKAS CSC par biometric device se Digital Life Certificate banwayen ya Sparsh portal ke liye appointment fix karein.",
      "Certificate generate hone ke baad receipt save karke apne pension record me update confirm kijiye.",
    ],
    suggestions: [
      "Pension / Life Certificate (DLC, Sparsh)",
      "Doorstep Biometric Seva",
      "Banking aur Passbook Update Assistance",
    ],
    reassurance:
      "Senior citizens aur veterans ke liye hum priority slot rakhte hain, isliye bina jhijhak bataye.",
  },
  {
    id: "samman",
    keywords: ["samman card", "sambhal card", "samman", "sambhal"],
    steps: [
      "Aapke rajya ke portal ke hisaab se required documents jaise Aadhaar, address proof, aur photo ready rakhiye.",
      "VIKAS CSC se online form fill karwayen aur biometric/OTP verification complete kijiye.",
      "Application submit hone ke baad acknowledgement slip sambhal ke rakhiye aur status track kijiye.",
    ],
    suggestions: [
      "Samman / Sambhal Card Registration",
      "Document Scanning & Upload Seva",
      "State Welfare Scheme Guidance",
    ],
  },
  {
    id: "aadhaar",
    keywords: [
      "aadhaar",
      "adhar",
      "aadhar",
      "pan",
      "passport",
      "update address",
      "dob",
      "name change",
    ],
    steps: [
      "Original Aadhaar card, proof of identity, aur proof of address documents ikattha kijiye.",
      "VIKAS CSC par update appointment le kar biometric/photo capture karwayen.",
      "Update request number (URN) ko track karke status confirm kijiye.",
    ],
    suggestions: [
      "Aadhaar Update & Enrollment",
      "PAN Application / Correction",
      "Passport Seva Booking Support",
    ],
  },
  {
    id: "banking",
    keywords: [
      "bank",
      "account",
      "passbook",
      "cash deposit",
      "aeps",
      "withdrawal",
      "micro atm",
      "loan",
    ],
    steps: [
      "Valid Aadhaar ya account number ke saath VIKAS CSC visit kijiye.",
      "Apni banking zaroorat bataiye, jaise cash deposit, withdrawal, balance enquiry ya loan application.",
      "Transaction receipt aur acknowledgement turant check karke safe rakhiye.",
    ],
    suggestions: [
      "AEPS Banking & Micro ATM",
      "Savings / RD / FD Account Assistance",
      "Loan & Insurance Consultation",
    ],
  },
  {
    id: "pm-schemes",
    keywords: [
      "pm",
      "pradhan mantri",
      "scheme",
      "yojana",
      "pmjay",
      "ayushman",
      "ujjwala",
      "pm kisan",
      "bill",
      "recharge",
      "electricity",
      "water bill",
    ],
    steps: [
      "Scheme ya bill ka naam bataakar required documents ready kijiye.",
      "VIKAS CSC par online portal login karke form fill ya payment initiate karwayen.",
      "Submission / payment receipt ko save karke confirmation SMS check kijiye.",
    ],
    suggestions: [
      "PM Yojana Registration & Support",
      "Utility Bill Payment",
      "Mobile / DTH Recharge",
    ],
  },
];

const defaultSuggestions = [
  "Pension / Life Certificate (DLC, Sparsh)",
  "Samman / Sambhal Card",
  "Banking, Aadhaar, PAN, Passport Services",
  "PM Schemes, Bill Payment, Recharge",
];

function normalise(text: string) {
  return text.toLowerCase();
}

function pickServiceGuide(message: string) {
  const cleaned = normalise(message);
  return serviceGuides.find((guide) =>
    guide.keywords.some((keyword) => cleaned.includes(keyword)),
  );
}

function formatSteps(steps: string[]) {
  return steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
}

function composeSuggestions(
  guide: ServiceGuide | undefined,
  extra: string[] = [],
) {
  const list = new Set(defaultSuggestions);
  if (guide) {
    guide.suggestions.forEach((item) => list.add(item));
  }
  extra.forEach((item) => list.add(item));
  return Array.from(list)
    .slice(0, 4)
    .join(" | ");
}

function generateFollowUp(name: string | undefined) {
  const greeting = name ? `Namaste ${name} ji!` : "Namaste ji!";
  const steps = [
    "Kripya bataye kaunsi seva chahiye: Pension, Aadhaar, Banking, PM Yojana ya koi aur?",
    "Aapke paas jo documents ya details hain unka short list share kijiye.",
    "Main turant agle kadam samjhaunga jaisi hi aap detail denge.",
  ];
  return [
    `${greeting} Main VIKAS AI Assistant hoon. Mujhe aapki madad ke liye thoda aur jaankari chahiye.`,
    formatSteps(steps),
    `Upyogi seva sujhav: ${composeSuggestions(undefined)}`,
    closingLine,
  ].join("\n");
}

function generateServiceReply(name: string | undefined, guide: ServiceGuide) {
  const greeting = name ? `Namaste ${name} ji!` : "Namaste ji!";
  const intro =
    "Main VIKAS AI Assistant hoon. Aapke liye yeh saral kadam follow kijiye:";
  const reassurance =
    guide.reassurance ??
    "Aap har kadam par hamare with trained digital seva expert ke saath rahenge.";
  const followUpPrompt =
    "Agar koi document missing ho ya ghar se seva chahiye to mujhe bataiye.";
  return [
    `${greeting} ${intro}`,
    formatSteps(guide.steps),
    reassurance,
    followUpPrompt,
    `Upyogi seva sujhav: ${composeSuggestions(guide)}`,
    closingLine,
  ].join("\n");
}

function generateGeneralReply(name: string | undefined) {
  const greeting = name ? `Namaste ${name} ji!` : "Namaste ji!";
  const intro =
    "Main VIKAS AI Assistant hoon. Aapke sawaal ko dhyan se samajh raha hoon.";
  const steps = [
    "Apni requirement bhejte waqt document ya reference number mention kijiye.",
    "VIKAS CSC par visit ya video call scheduling ke liye preferred time bataye.",
    "Main confirm karne ke baad receipt aur tracking help bhi dunga.",
  ];
  return [
    `${greeting} ${intro}`,
    formatSteps(steps),
    "Aap chahe to pension, Aadhaar, banking, ya kisi PM scheme ki seva bhi yahin se le sakte hain.",
    `Upyogi seva sujhav: ${composeSuggestions(undefined, ["Doorstep Support Booking"])}`,
    closingLine,
  ].join("\n");
}

function generateAssistantReply(
  name: string | undefined,
  message: string,
): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return generateFollowUp(name);
  }
  const guide = pickServiceGuide(trimmed);
  const ambiguous = trimmed.length < 8 || /\bhelp\b/i.test(trimmed);
  if (!guide && ambiguous) {
    return generateFollowUp(name);
  }
  if (guide) {
    return generateServiceReply(name, guide);
  }
  return generateGeneralReply(name);
}

function initialAssistantMessage(): ChatMessage {
  return {
    id: Date.now(),
    role: "assistant",
    content: [
      "Namaste! Main VIKAS AI Assistant hoon. Kripya apna naam aur seva ki jarurat likhiye taaki main sahi madad de sakun.",
      formatSteps([
        "Apna naam ya parichay share kijiye.",
        "Seva ka naam aur short detail bataye.",
        "Agar documents ready hain to unka zikr kijiye.",
      ]),
      `Upyogi seva sujhav: ${composeSuggestions(undefined)}`,
      closingLine,
    ].join("\n"),
  };
}

export default function Home() {
  const [customerName, setCustomerName] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialAssistantMessage(),
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const effectiveName = useMemo(() => {
    const clean = customerName.trim();
    if (!clean) {
      return undefined;
    }
    return clean
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [customerName]);

  const handleSend = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isProcessing) {
      return;
    }
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    const reply = generateAssistantReply(effectiveName, text);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
        },
      ]);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:px-6">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
              VIKAS CSC
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              VIKAS AI Assistant – Caring Digital Seva Partner
            </h1>
            <p className="text-sm md:text-base text-slate-200">
              Veterans, senior citizens aur patients ke liye vishesh dhyaan. Har
              sawaal ka jawab saral Hinglish mein, respect ke saath.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur">
            <h2 className="text-lg font-semibold text-emerald-200">
              Aapki Basic Details
            </h2>
            <label className="space-y-2 text-sm text-slate-100">
              <span>Aapka naam (optional) </span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Jaise: Ramesh Kumar"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-300 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
              />
            </label>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-xs leading-relaxed text-slate-200">
              <p className="font-semibold text-emerald-200">Seva Highlights</p>
              <ul className="mt-2 space-y-2">
                <li>
                  ✅ Pension & Life Certificate (DLC, Sparsh) with doorstep
                  support
                </li>
                <li>✅ Samman / Sambhal Card, senior citizen special care</li>
                <li>✅ Banking, Aadhaar, PAN, Passport seva ek hi jagah</li>
                <li>✅ PM schemes, bill payment, recharge bilkul asaan</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-4 text-xs text-emerald-100">
              <p className="font-semibold">Guideline</p>
              <p>
                Har consultancy par ham naam se greet karte hain aur documents
                verify karke secure seva dete hain. Message bhejte waqt detail
                jitni zyada hogi, utni tezi se seva milegi.
              </p>
            </div>
          </aside>

          <main className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div
              ref={containerRef}
              className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
            >
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xl rounded-3xl px-4 py-3 text-sm leading-6 shadow-md ${
                      message.role === "assistant"
                        ? "bg-emerald-400/10 text-emerald-50"
                        : "bg-emerald-500 text-slate-900"
                    } whitespace-pre-line`}
                  >
                    {message.content}
                  </div>
                </article>
              ))}
              {isProcessing && (
                <article className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-3xl bg-emerald-400/10 px-4 py-2 text-emerald-50">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200 [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200 [animation-delay:0.3s]" />
                  </div>
                </article>
              )}
            </div>
            <form
              onSubmit={handleSend}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4"
            >
              <label className="text-sm text-slate-200">
                Aapka prashn
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Yahaan likhiye... jaise: Mujhe Sparsh life certificate renew karna hai."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                />
              </label>
              <button
                type="submit"
                className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100"
                disabled={isProcessing}
              >
                {isProcessing ? "Please wait…" : "Send Message"}
              </button>
            </form>
          </main>
        </section>
      </div>
    </div>
  );
}
