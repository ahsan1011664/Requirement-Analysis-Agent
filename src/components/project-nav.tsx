"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "workspace", label: "Workspace" },
  { href: "requirements", label: "Requirements" },
  { href: "database", label: "Database" },
  { href: "risks", label: "Risks" },
  { href: "report", label: "Final Report" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const href = `/projects/${projectId}/${link.href}`;
        const active = pathname === href;

        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkflowProgress({ status }: { status: string }) {
  const steps = [
    { key: "draft", label: "Idea" },
    { key: "analyzing", label: "Analysis" },
    { key: "clarification", label: "Clarification" },
    { key: "generating", label: "Generation" },
    { key: "complete", label: "SRS Ready" },
  ];

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === status)
  );
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              index <= currentIndex
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
