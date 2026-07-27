import type { SVGProps } from "react";
import type { IconName } from "@/lib/content";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function SvgBase({ size = 24, title, children, ...props }: IconProps) {
  const decorative = !title;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative}
      role={decorative ? undefined : "img"}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const line = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowRightIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 12H19" {...line} />
      <path d="M14 7L19 12L14 17" {...line} />
    </SvgBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 9L12 15L18 9" {...line} />
    </SvgBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4 7H20M4 12H20M4 17H20" {...line} />
    </SvgBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M6 6L18 18M18 6L6 18" {...line} />
    </SvgBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.25" {...line} />
      <path d="M15.25 15.25L20 20" {...line} />
    </SvgBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="8" r="3.25" {...line} />
      <path d="M5.5 19C6.2 15.6 8.5 14 12 14C15.5 14 17.8 15.6 18.5 19" {...line} />
    </SvgBase>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4 5L20 12L4 19L7 12L4 5Z" {...line} />
      <path d="M7 12H14" {...line} />
    </SvgBase>
  );
}

export function AttachmentIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M8.5 12.5L13.8 7.2C15.2 5.8 17.4 5.8 18.8 7.2C20.2 8.6 20.2 10.8 18.8 12.2L11.7 19.3C9.7 21.3 6.4 21.3 4.4 19.3C2.4 17.3 2.4 14 4.4 12L11.2 5.2" {...line} />
    </SvgBase>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4.5 8.5A8 8 0 1 1 4.2 15" {...line} />
      <path d="M4.5 4.5V8.5H8.5" {...line} />
      <path d="M12 8V12L15 14" {...line} />
    </SvgBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="8" {...line} />
      <path d="M8.5 12L10.8 14.3L15.8 9.3" {...line} />
    </SvgBase>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M13 5H19V11" {...line} />
      <path d="M19 5L11 13" {...line} />
      <path d="M18 14V18C18 18.55 17.55 19 17 19H6C5.45 19 5 18.55 5 18V7C5 6.45 5.45 6 6 6H10" {...line} />
    </SvgBase>
  );
}

export function ServiceIcon({ name, size = 48, ...props }: IconProps & { name: IconName }) {
  const common = { size, viewBox: "0 0 48 48", ...props };
  const serviceLine = { ...line, strokeWidth: 1.6 };

  if (name === "web") {
    return (
      <SvgBase {...common}>
        <rect x="5" y="7" width="38" height="34" rx="4" {...serviceLine} />
        <path d="M5 15H43" {...serviceLine} />
        <circle cx="11" cy="11" r="1" fill="currentColor" />
        <circle cx="15" cy="11" r="1" fill="currentColor" opacity="0.65" />
        <path d="M11 22H26M11 27H36M11 32H31" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "commerce") {
    return (
      <SvgBase {...common}>
        <path d="M13 17H38L35 33H16L11 10H6" {...serviceLine} />
        <circle cx="19" cy="38" r="2" {...serviceLine} />
        <circle cx="32" cy="38" r="2" {...serviceLine} />
        <path d="M19 22H31M25 19V29" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "software") {
    return (
      <SvgBase {...common}>
        <rect x="18" y="18" width="12" height="12" rx="3" {...serviceLine} />
        <rect x="5" y="7" width="10" height="8" rx="2" {...serviceLine} />
        <rect x="33" y="7" width="10" height="8" rx="2" {...serviceLine} />
        <rect x="5" y="33" width="10" height="8" rx="2" {...serviceLine} />
        <rect x="33" y="33" width="10" height="8" rx="2" {...serviceLine} />
        <path d="M15 11H24V18M33 11H24M15 37H24V30M33 37H24" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "saas") {
    return (
      <SvgBase {...common}>
        <path d="M14 34H36C40 34 43 31 43 27C43 23.3 40.3 20.4 36.8 20C35.7 14.8 31.1 11 25.5 11C19.7 11 14.9 15.2 14 20.7C9.1 20.9 5 24.9 5 29.8C5 32.1 6 34.2 7.6 35.7" {...serviceLine} />
        <rect x="17" y="23" width="14" height="10" rx="2.5" {...serviceLine} />
        <path d="M21 28H27" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "ai") {
    return (
      <SvgBase {...common}>
        <circle cx="24" cy="24" r="6" {...serviceLine} />
        <circle cx="24" cy="7" r="3" {...serviceLine} />
        <circle cx="41" cy="24" r="3" {...serviceLine} />
        <circle cx="24" cy="41" r="3" {...serviceLine} />
        <circle cx="7" cy="24" r="3" {...serviceLine} />
        <path d="M24 10V18M38 24H30M24 30V38M10 24H18" {...serviceLine} />
        <path d="M19.8 19.8L13.2 13.2M28.2 19.8L34.8 13.2M28.2 28.2L34.8 34.8M19.8 28.2L13.2 34.8" {...serviceLine} opacity="0.7" />
      </SvgBase>
    );
  }

  if (name === "automation") {
    return (
      <SvgBase {...common}>
        <circle cx="24" cy="24" r="7" {...serviceLine} />
        <path d="M24 17V12M31 24H37M24 31V36M17 24H11" {...serviceLine} />
        <rect x="20" y="5" width="8" height="7" rx="2" {...serviceLine} />
        <rect x="37" y="20" width="7" height="8" rx="2" {...serviceLine} />
        <rect x="20" y="36" width="8" height="7" rx="2" {...serviceLine} />
        <rect x="4" y="20" width="7" height="8" rx="2" {...serviceLine} />
        <path d="M21 24L23 26L27 22" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "design") {
    return (
      <SvgBase {...common}>
        <rect x="6" y="7" width="36" height="34" rx="4" {...serviceLine} />
        <path d="M6 16H42M16 16V41" {...serviceLine} />
        <rect x="21" y="21" width="15" height="6" rx="2" {...serviceLine} />
        <rect x="21" y="31" width="7" height="5" rx="1.5" {...serviceLine} />
        <path d="M10 11H12M15 11H17" {...serviceLine} />
      </SvgBase>
    );
  }

  if (name === "performance") {
    return (
      <SvgBase {...common}>
        <path d="M8 36A17 17 0 0 1 40 36" {...serviceLine} />
        <path d="M13 36H35" {...serviceLine} />
        <path d="M24 31L33 18" {...serviceLine} />
        <circle cx="24" cy="31" r="2.5" {...serviceLine} />
        <path d="M12 27L9 25M17 20L15 16M24 18V13M31 20L34 16M36 27L40 25" {...serviceLine} />
      </SvgBase>
    );
  }

  return (
    <SvgBase {...common}>
      <rect x="7" y="8" width="34" height="31" rx="4" {...serviceLine} />
      <path d="M13 16H35M13 23H29M13 30H24" {...serviceLine} />
      <circle cx="34" cy="31" r="7" fill="var(--surface-primary, #111e30)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M31 31L33 33L37 29" {...serviceLine} />
    </SvgBase>
  );
}

export function ArcatesMark({ size = 36, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 31L24 12L33 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 25H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12" r="2.5" fill="currentColor" />
      <circle cx="15" cy="31" r="2.5" fill="currentColor" />
      <circle cx="33" cy="31" r="2.5" fill="currentColor" />
    </svg>
  );
}
