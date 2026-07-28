"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

type AccordionItem = {
  title: string;
  content: string;
};

type AccordionProps = {
  items: readonly AccordionItem[];
  defaultOpen?: number;
  className?: string;
};

export function Accordion({ items, defaultOpen = 0, className = "" }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const id = useId();

  return (
    <div className={`premium-accordion${className ? ` ${className}` : ""}`}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${id}-button-${index}`;
        const panelId = `${id}-panel-${index}`;

        return (
          <div className={`premium-accordion__item${open ? " is-open" : ""}`} key={item.title}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span className="premium-accordion__icon" aria-hidden="true"><span /></span>
                <span>{item.title}</span>
                <ChevronDownIcon className="premium-accordion__chevron" size={18} />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!open}
              className="premium-accordion__panel"
            >
              <div><p>{item.content}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
