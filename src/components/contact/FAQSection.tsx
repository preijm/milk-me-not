import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

export const FAQSection = ({ title, items }: FAQSectionProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-8 max-w-4xl mx-auto">
      


      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) =>
        <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>);

};