const STEPS: { text: string; command?: string }[] = [
  { text: 'First create an account with your GitHub by clicking "Login".' },
  {
    text: "Connect your device with slidesk.link",
    command: "slidesk link login",
  },
  { text: "Host a presentation for 72h", command: "slidesk link host" },
  {
    text: "Or push information about your talk to your page",
    command: "slidesk link push",
  },
];

export function HeroSteps() {
  return (
    <ol className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
      {STEPS.map((step, i) => (
        <li
          key={step.command ?? step.text}
          className="flex gap-3 rounded-lg border bg-card/60 p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">{step.text}</p>
            {step.command && (
              <code className="block overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                {step.command}
              </code>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
