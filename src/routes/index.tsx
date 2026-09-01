import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/Confetti";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Chotuu — A Tiny Handmade Card" },
      {
        name: "description",
        content:
          "An interactive handmade friendship card for Chotuu: hidden flaps, tiny games, a secret envelope and one very heartfelt message.",
      },
      { property: "og:title", content: "For Chotuu — A Tiny Handmade Card" },
      {
        property: "og:description",
        content:
          "Unfold flaps, take the Chotuu Test, press the button you shouldn't press, and open the secret envelope.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_income" },
    ],
  }),
  component: CardExperience,
});

/* ---------------- tiny shared bits ---------------- */

function Doodle({ className = "", char = "✿" }: { className?: string; char?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute select-none hand text-rose/60 ${className}`}
    >
      {char}
    </span>
  );
}

function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`tape-piece pointer-events-none absolute h-5 w-16 rotate-[-6deg] rounded-[2px] ${className}`}
    />
  );
}

function PaperButton({
  children,
  onClick,
  tone = "ink",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "ink" | "rose" | "quiet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    ink: "bg-paper-deep text-ink border-border",
    rose: "bg-primary text-primary-foreground border-primary",
    quiet: "bg-transparent text-muted-foreground border-border border-dashed",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hand inline-flex items-center gap-2 rounded-full border px-5 py-2 text-lg shadow-[0_3px_0_0_oklch(0.4_0.05_40/0.18)] transition-transform duration-200 active:translate-y-[2px] active:shadow-none hover:-translate-y-[1px] ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="display text-center text-2xl leading-tight text-ink sm:text-3xl">
      {children}
    </h2>
  );
}

/* ---------------- flaps ---------------- */

const FLAPS: { label: string; lines: string[]; emoji: string }[] = [
  {
    label: "Open this",
    emoji: "💌",
    lines: [
      "You talk a LOT.",
      "Like… genuinely a lot.",
      "But honestly, I'd miss it if you suddenly stopped. ❤️",
    ],
  },
  {
    label: "Definitely don't open this",
    emoji: "🙈",
    lines: [
      "You opened it. Obviously.",
      "Zero self control, full personality.",
      "Never change. (Please. It's funny.)",
    ],
  },
  {
    label: "Okay, this one is important",
    emoji: "📌",
    lines: [
      "If you're having a heavy day —",
      "text me. Even at 2am. Even the nonsense version.",
      "I'd rather hear it than have you carry it alone.",
    ],
  },
  {
    label: "Secret 🤫",
    emoji: "🤫",
    lines: [
      "I actually save your voice notes.",
      "The 7-minute ones too.",
      "Don't let this go to your head. Too late, right?",
    ],
  },
];

function Flaps() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FLAPS.map((f, i) => {
        const isOpen = !!open[i];
        return (
          <div key={f.label} className="relative">
            <div className="paper-deep relative overflow-hidden rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                className="hand relative z-10 flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-lg text-ink"
                style={{
                  transformOrigin: "top center",
                  transform: isOpen ? "rotateX(-14deg)" : "rotateX(0deg)",
                  transition: "transform 500ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <span>
                  {f.emoji} {f.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {isOpen ? "close" : "lift"}
                </span>
              </button>
              <div
                className="grid transition-all duration-500 ease-out"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="paper m-2 rounded-lg border border-border/70 px-4 py-4">
                    {f.lines.map((l, k) => (
                      <p
                        key={l}
                        className={`hand text-xl leading-snug ${k === f.lines.length - 1 ? "mt-2 text-rose" : "text-ink/85"}`}
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- quiz ---------------- */

const QUIZ: { q: string; options: string[] }[] = [
  {
    q: "How long is a 'quick story'?",
    options: ["30 seconds", "5 minutes", "20 minutes", "There is no such thing"],
  },
  {
    q: "What happens when Chotuu says 'one last thing'?",
    options: [
      "The conversation ends",
      "Another story begins",
      "A new topic appears",
      "All of the above",
    ],
  },
  {
    q: "Chotuu's reaction to gossip she already knows?",
    options: [
      "Stays quiet",
      "'WAIT I know this one'",
      "Tells it back to you, better",
      "Both of the last two",
    ],
  },
  {
    q: "How many times will she say 'I'm going to sleep' before sleeping?",
    options: ["Once", "Three", "Seven", "Math cannot help here"],
  },
  {
    q: "Best way to make Chotuu talk for an hour?",
    options: ["Ask a question", "Ask nothing", "Say 'nothing happened today'", "Exist"],
  },
];

function ChotuuTest({ onWin }: { onWin: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const pick = () => {
    if (step + 1 >= QUIZ.length) {
      setDone(true);
      onWin();
    } else {
      setStep(step + 1);
    }
  };

  if (done) {
    return (
      <div className="paper animate-rise rounded-2xl border border-border p-6 text-center">
        <p className="hand text-3xl text-rose">Result: 100% Chotuu.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Every answer was correct. That's the whole personality. 😂
        </p>
        <PaperButton
          className="mt-4"
          tone="quiet"
          onClick={() => {
            setDone(false);
            setStep(0);
          }}
        >
          Take it again 🔁
        </PaperButton>
      </div>
    );
  }

  const item = QUIZ[step]!;
  return (
    <div className="paper rounded-2xl border border-border p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Question {step + 1} / {QUIZ.length}
      </p>
      <p key={item.q} className="hand animate-rise mt-2 text-2xl text-ink">
        {item.q}
      </p>
      <div className="mt-4 grid gap-2">
        {item.options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={pick}
            className="paper-deep hand rounded-xl border border-border px-4 py-2 text-left text-lg text-ink transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-[1px]"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- pick a card ---------------- */

const PICKS: { cat: string; msg: string }[] = [
  {
    cat: "❤️ Something I appreciate",
    msg: "You check in on people even when nobody checks in on you.",
  },
  {
    cat: "😂 Something that makes me laugh",
    msg: "Your dramatic pause before a story that has no ending.",
  },
  {
    cat: "🫶 Something I hope you remember",
    msg: "You're not 'too much'. You're just not small.",
  },
  {
    cat: "🤍 Something I don't say enough",
    msg: "You've made my life louder and a lot warmer. Thank you.",
  },
  { cat: "😈 A Chotuu complaint", msg: "Voice note. Nine minutes. About nothing. Again." },
  { cat: "✨ A little surprise", msg: "This whole card was made instead of sleeping. Worth it." },
];

function PickACard() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PICKS.map((p, i) => {
        const isFlipped = !!flipped[i];
        return (
          <button
            key={p.cat}
            type="button"
            onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
            className="h-40 [perspective:900px]"
            aria-label={p.cat}
          >
            <span
              className="relative block h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
              style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <span className="paper-deep absolute inset-0 flex items-center justify-center rounded-xl border border-border p-3 [backface-visibility:hidden]">
                <span className="hand text-lg leading-tight text-ink">{p.cat}</span>
              </span>
              <span className="paper absolute inset-0 flex items-center justify-center rounded-xl border border-rose/30 p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="hand text-lg leading-tight text-rose">{p.msg}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- do not press ---------------- */

const PRESSES = [
  "I knew you'd press it.",
  "Still pressing?",
  "Chotuu. Please.",
  "Okay, now you're just proving my point. 😂",
  "This button has no more secrets. You do.",
  "Fine. One more. But that's it.",
  "You said that last time.",
  "Somewhere, a scientist is taking notes.",
  "Legally this is now your hobby.",
  "Okay respect. Genuinely impressive stubbornness.",
];

function DoNotPress() {
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const press = () => {
    const n = count + 1;
    setCount(n);
    if (n <= 4) setMsg(PRESSES[n - 1]!);
    else setMsg(PRESSES[4 + Math.floor(Math.random() * (PRESSES.length - 4))]!);
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={press}
        className="hand animate-wiggle rounded-full border-2 border-dashed border-destructive/70 bg-destructive/10 px-6 py-3 text-xl text-destructive shadow-[0_3px_0_0_oklch(0.6_0.2_25/0.25)] active:translate-y-[2px]"
      >
        DO NOT PRESS.
      </button>
      {msg && (
        <p key={count} className="hand animate-rise mt-3 text-2xl text-ink">
          {msg}
        </p>
      )}
      {count > 3 && (
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          presses: {count}
        </p>
      )}
    </div>
  );
}

/* ---------------- envelope ---------------- */

const HEARTFELT = [
  "Okay, jokes aside…",
  "You're one of those people who makes ordinary days feel a little less ordinary.",
  "I joke about how much you talk, how chaotic you can be, and all the little things that make you Chotuu.",
  "But honestly, those little things are exactly what make you you.",
  "I'm genuinely grateful for your friendship.",
  "Not every friendship needs some huge explanation. Sometimes it's simply knowing there's someone you can laugh with, talk nonsense with, annoy endlessly, and still genuinely care about.",
  "So thank you for being you, Chotuu. ❤️",
];

function SecretEnvelope({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => {
          if (!open) {
            setOpen(true);
            onOpen();
          }
        }}
        className="relative h-40 w-64 max-w-full [perspective:800px]"
        aria-label="Open the secret envelope"
      >
        <span className="paper-deep absolute inset-0 rounded-lg border border-border shadow-[var(--shadow-paper)]" />
        <span
          className="paper absolute left-0 right-0 top-0 h-1/2 origin-top rounded-t-lg border border-border transition-transform duration-700"
          style={{
            transform: open ? "rotateX(-172deg)" : "rotateX(0deg)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        <span className="hand absolute bottom-4 left-0 right-0 text-center text-lg text-ink/80">
          {open ? "…" : "Open when you're ready."}
        </span>
        {!open && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
            ❤️
          </span>
        )}
      </button>

      {open && (
        <div className="paper animate-rise relative mt-6 w-full rounded-2xl border border-border p-6">
          <Tape className="-top-2 left-8" />
          <Tape className="-top-2 right-8 rotate-[7deg]" />
          {HEARTFELT.map((line, i) => (
            <p
              key={line}
              className={
                i === 0
                  ? "hand text-2xl text-rose"
                  : i === HEARTFELT.length - 1
                    ? "hand mt-4 text-2xl text-rose"
                    : "mt-3 text-[15px] leading-relaxed text-ink/85"
              }
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- final fold ---------------- */

function FinalFold({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-sm [perspective:1200px]">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            onOpen();
          }}
          className="paper animate-float-soft relative w-full rounded-xl border border-border px-6 py-10"
        >
          <Tape className="-top-2 left-1/2 -translate-x-1/2" />
          <span className="hand text-2xl text-ink">One last thing…</span>
          <span className="mt-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
            tap to unfold
          </span>
        </button>
      ) : (
        <div className="paper animate-rise relative rounded-xl border border-border px-6 py-10 text-center">
          <Doodle className="left-4 top-3 text-xl" char="✧" />
          <Doodle className="right-5 top-6 text-lg" char="♡" />
          <p className="hand text-3xl leading-snug text-rose">
            I'm really glad you're my friend. ❤️
          </p>
          <p className="hand mt-3 text-xl text-ink/80">Now go ahead. You can talk. 😂</p>
          <p className="hand mt-8 text-2xl text-ink/70 [transform:rotate(-4deg)]">
            — Your friend
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- main ---------------- */

function CardExperience() {
  const [opened, setOpened] = useState(false);
  const [stage, setStage] = useState(0); // how many inside blocks are revealed
  const [burst, setBurst] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  const boom = useCallback(() => setBurst((b) => b + 1), []);

  useEffect(() => {
    if (stage > 0) {
      const t = setTimeout(
        () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
        220,
      );
      return () => clearTimeout(t);
    }
  }, [stage]);

  const next = () => setStage((s) => s + 1);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-16">
      <Confetti burstKey={burst} />

      {/* desk decorations */}
      <Doodle className="left-4 top-6 text-2xl" char="✦" />
      <Doodle className="right-6 top-16 text-xl" char="♡" />
      <Doodle className="bottom-10 left-8 text-xl" char="✿" />

      <div className="mx-auto w-full max-w-md">
        {/* COVER */}
        <div className="[perspective:1400px]">
          <div
            className="paper relative mx-auto rounded-2xl border border-border px-6 py-12 text-center"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
              transform: opened
                ? "rotateY(-166deg) translateZ(0)"
                : "rotateY(0deg) translateZ(0)",
              transition: "transform 1.5s cubic-bezier(.5,.05,.15,1)",
              height: opened ? 0 : "auto",
              opacity: opened ? 0 : 1,
              marginBottom: opened ? 0 : undefined,
              pointerEvents: opened ? "none" : "auto",
            }}
          >
            <Tape className="-top-2 left-10" />
            <Tape className="-top-2 right-10 rotate-[8deg]" />
            <Doodle className="left-5 top-8 text-lg" char="✧" />
            <Doodle className="right-6 bottom-8 text-lg" char="✦" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              handmade · one of one
            </p>
            <h1 className="display mt-6 text-4xl leading-tight text-ink sm:text-5xl">
              For Chotuu ❤️
            </h1>
            <p className="hand mt-3 text-xl text-ink/70">
              A tiny card for a very talkative human. 😂
            </p>
            <div className="mt-9">
              <PaperButton tone="rose" onClick={() => setOpened(true)}>
                Open me ✉️
              </PaperButton>
            </div>
          </div>
        </div>

        {/* INSIDE */}
        {opened && (
          <div className="space-y-10">
            <div className="paper animate-rise relative rounded-2xl border border-border px-6 py-10 text-center">
              <Doodle className="right-5 top-4 text-lg" char="♡" />
              <p className="hand text-2xl leading-snug text-ink">
                Okay Chotuu… before you start talking…
              </p>
              <p className="display mt-5 text-3xl text-rose">I made this for you.</p>
              {stage === 0 && (
                <div className="mt-7">
                  <PaperButton onClick={next}>Continue 👀</PaperButton>
                </div>
              )}
            </div>

            {stage >= 1 && (
              <section className="animate-rise space-y-4">
                <SectionTitle>Little flaps. Lift them.</SectionTitle>
                <Flaps />
                {stage === 1 && (
                  <div className="text-center">
                    <PaperButton onClick={next}>Continue 👀</PaperButton>
                  </div>
                )}
              </section>
            )}

            {stage >= 2 && (
              <section className="animate-rise space-y-4">
                <SectionTitle>The Chotuu Test</SectionTitle>
                <p className="hand text-center text-xl text-ink/70">
                  How well do you know yourself?
                </p>
                <ChotuuTest onWin={boom} />
                {stage === 2 && (
                  <div className="text-center">
                    <PaperButton onClick={next}>Continue 👀</PaperButton>
                  </div>
                )}
              </section>
            )}

            {stage >= 3 && (
              <section className="animate-rise space-y-4">
                <SectionTitle>Pick a card</SectionTitle>
                <p className="hand text-center text-xl text-ink/70">
                  Tap any one. Or all six, obviously.
                </p>
                <PickACard />
                {stage === 3 && (
                  <div className="text-center">
                    <PaperButton onClick={next}>Continue 👀</PaperButton>
                  </div>
                )}
              </section>
            )}

            {stage >= 4 && (
              <section className="animate-rise space-y-4">
                <div className="paper relative rounded-2xl border border-border px-5 py-8">
                  <DoNotPress />
                </div>
                {stage === 4 && (
                  <div className="text-center">
                    <PaperButton onClick={next}>Continue 👀</PaperButton>
                  </div>
                )}
              </section>
            )}

            {stage >= 5 && (
              <section className="animate-rise space-y-5">
                <SectionTitle>A secret envelope</SectionTitle>
                <SecretEnvelope onOpen={boom} />
                {stage === 5 && (
                  <div className="text-center">
                    <PaperButton onClick={next}>Continue 👀</PaperButton>
                  </div>
                )}
              </section>
            )}

            {stage >= 6 && (
              <section className="animate-rise space-y-5 pb-14">
                <FinalFold onOpen={boom} />
                <p className="hand text-center text-lg text-ink/50">
                  (you may now resume talking) 😂
                </p>
              </section>
            )}

            <div ref={endRef} />
          </div>
        )}
      </div>
    </main>
  );
}
