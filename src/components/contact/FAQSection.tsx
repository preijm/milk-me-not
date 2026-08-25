import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";
import { DropGlyph } from "@/components/story";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

/**
 * A single accordion, restyled for the story surface. `title` is not printed
 * — every page that uses this already carries its own `SectionHead` above it,
 * so a second visible heading here would just repeat itself. It still does a
 * job: an accessible, screen-reader-only label for the list.
 *
 * `story-lift` plus the drop-marked questions give it the same weight as the
 * cards above it, so the accordion doesn't read as the one flat, unstyled
 * box on an otherwise confident page.
 */
export const FAQSection = ({ title, items }: FAQSectionProps) => {
  return (
    <div className="story-hairline story-lift mx-auto w-full max-w-4xl rounded-[1.25rem] bg-white p-5 sm:p-8">
      <h2 className="sr-only">{title}</h2>

      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) =>
        <AccordionItem key={index} value={`item-${index + 1}`} className="border-story-ink/8">
            <AccordionTrigger className="story-serif gap-4 text-left text-[1.0625rem] font-bold text-story-ink hover:no-underline">
              <span className="flex items-center gap-3">
                <DropGlyph size={13} className="shrink-0 text-story-green-dark" />
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6.5 text-[0.9375rem] leading-relaxed text-story-muted">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>);

};