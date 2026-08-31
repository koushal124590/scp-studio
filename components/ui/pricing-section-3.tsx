"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Starter",
    description:
      "Great for small businesses and startups looking to get started with AI",
    price: 12,
    yearlyPrice: 99,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Up to 10 boards per workspace", icon: <Briefcase size={20} /> },
      { text: "Up to 10GB storage", icon: <Database size={20} /> },
      { text: "Limited analytics", icon: <Server size={20} /> },
    ],
    includes: [
      "Free includes:",
      "Unlimted Cards",
      "Custom background & stickers",
      "2-factor authentication",
    ],
  },
  {
    name: "Business",
    description:
      "Best value for growing businesses that need more advanced features",
    price: 48,
    yearlyPrice: 399,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Unlimted boards", icon: <Briefcase size={20} /> },
      { text: "Storage (250MB/file)", icon: <Database size={20} /> },
      { text: "100 workspace command runs", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Advanced checklists",
      "Custom fields",
      "Servedless functions",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Advanced plan with enhanced security and unlimited access for large teams",
    price: 96,
    yearlyPrice: 899,
    popular: true,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    features: [
      { text: "Unlimited board", icon: <Briefcase size={20} /> },
      { text: "Unlimited storage ", icon: <Database size={20} /> },
      { text: "Unlimited workspaces", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Business, plus:",
      "Multi-board management",
      "Multi-board guest",
      "Attachment permissions",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-neutral-800 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0"
              ? "text-white"
              : "text-neutral-400 hover:text-white",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border border-neutral-700 bg-neutral-800 shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1"
              ? "text-white"
              : "text-neutral-400 hover:text-white",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border border-neutral-700 bg-neutral-800 shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="px-4 pt-20 min-h-screen max-w-7xl mx-auto relative text-white"
      ref={pricingRef}
    >
      <article className="flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between mb-12">
        <div className="text-left mb-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-[130%] text-white mb-4">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start"
            >
              Plans & Pricing
            </VerticalCutReveal>
          </h2>

          <p className="text-neutral-400 max-w-xl text-base">
            Trusted by creators and studios worldwide. Select the perfect tier for infinite vectorization, 1000% upscaling, and 3D card physics.
          </p>
        </div>

        <div>
          <PricingSwitch onSwitch={togglePricingPeriod} className="shrink-0" />
        </div>
      </article>

      <div className="grid md:grid-cols-3 gap-6 mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex-col flex justify-between p-6 rounded-2xl border transition-all duration-300 ${
              plan.popular
                ? "scale-105 ring-2 ring-emerald-500/50 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white shadow-2xl shadow-emerald-500/10 border-neutral-700"
                : "bg-neutral-950/80 border-neutral-800 text-white hover:border-neutral-700"
            }`}
          >
            <CardContent className="p-0">
              <div className="space-y-2 pb-4">
                {plan.popular && (
                  <div className="mb-2">
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className="text-neutral-400 ml-2 text-sm">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-400 mb-6">
                {plan.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h4 className="font-semibold text-sm text-neutral-200">
                  {plan.includes[0]}
                </h4>
                <ul className="space-y-2.5">
                  {plan.includes.slice(1).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-neutral-300">
                      <span className="text-emerald-400 mr-2.5">
                        <CheckCheck className="h-4 w-4" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-8">
              <button
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-lg shadow-emerald-500/25"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                }`}
              >
                {plan.buttonText}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
