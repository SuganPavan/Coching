"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-premium",
        accent: "bg-accent text-accent-foreground shadow-soft hover:-translate-y-0.5 hover:bg-saffron-600 hover:shadow-glow-accent",
        outline: "border border-input bg-background hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
        ghost: "hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and disables the button — for async submit actions. */
  loading?: boolean;
}

// Adds a subtle Material-style ripple centered on the click point. Purely a
// visual affordance layered on top of the existing onClick handler passed
// in via ...props — it never intercepts or changes click behavior.
function useRipple() {
  const [ripples, setRipples] = React.useState<{ x: number; y: number; size: number; id: number }[]>([]);

  const addRipple = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, size, id }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, onClick, children, disabled, ...props }, ref) => {
    const { ripples, addRipple } = useRipple();

    if (asChild) {
      const Comp = Slot;
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={(e) => {
          addRipple(e);
          onClick?.(e);
        }}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/40"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              animation: "ripple 600ms ease-out",
            }}
          />
        ))}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
