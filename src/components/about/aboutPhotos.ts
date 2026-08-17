/**
 * The only real photography the site has.
 *
 * Everywhere else the brand works in flat colour and drawn shape, so About is
 * the one page that can lead with pictures — and these are genuine: the actual
 * bottles from the joke that started it, the original spreadsheet, and cartons
 * the founders photographed while rating them.
 */

import soySauceMilkPhoto from "@/assets/soy-sauce-milk-photo.jpg";
import milkSoySaucePhoto from "@/assets/milk-soy-sauce-photo.jpg";
import spreadsheetImage from "@/assets/milk-tests-spreadsheet.png";
import testingSession from "@/assets/milk-testing-session.jpg";
import soyMilkDrawing from "@/assets/soy-milk-drawing.jpg";
import erwtenDrink from "@/assets/community/erwten-drink.jpg";
import gutBioBarista from "@/assets/community/gut-bio-barista.jpg";
import abbotKinneyAmandel from "@/assets/community/abbot-kinney-amandel.jpg";
import rudeHealthPotato from "@/assets/community/rude-health-potato.jpg";
import broseOat from "@/assets/community/brose-oat.jpg";
import lupineDrink from "@/assets/community/lupine-drink.jpg";
import milsaSoja from "@/assets/community/milsa-soja.jpg";
import campinaHaver from "@/assets/community/campina-haver.jpg";
import alproNotMilk from "@/assets/community/alpro-not-milk.jpg";
import sproudMilk2 from "@/assets/community/sproud-milk-2.jpg";
import beriefBarista from "@/assets/community/berief-barista.jpg";

export type Photo = { src: string; alt: string; caption?: string };

export const CULPRITS: Photo[] = [
  {
    src: soySauceMilkPhoto,
    alt: "An Alpro plant milk carton beside a bottle of shoyu soy sauce, with a glass of the mixture",
    caption: "Exhibit A",
  },
  {
    src: milkSoySaucePhoto,
    alt: "A carton of Magere Melk dairy milk next to the same soy sauce bottle",
    caption: "Exhibit B",
  },
];

export const SPREADSHEET: Photo = {
  src: spreadsheetImage,
  alt: "The original milk testing spreadsheet, rows of brands with scores and notes",
  caption: "The spreadsheet, before anyone called it a product",
};

export const TASTING: Photo = {
  src: testingSession,
  alt: "A table of plant milk cartons and glasses set up for a tasting session",
  caption: "A tasting, mid-argument",
};

export const DRAWING: Photo = {
  src: soyMilkDrawing,
  alt: "A hand-drawn sketch of a soy milk carton",
};

export const CARTONS: Photo[] = [
  { src: erwtenDrink, alt: "AH Erwten Drink, a pea-based milk" },
  { src: gutBioBarista, alt: "Gut Bio Barista Hafer Drink, an oat barista milk, poured into a latte" },
  { src: abbotKinneyAmandel, alt: "Abbot Kinney's Barista Amandel almond milk" },
  { src: rudeHealthPotato, alt: "Rude Health Tiger Nut and Potato Barista drinks" },
  { src: broseOat, alt: "Brose Scottish Goodness fresh oat drink, barista style" },
  { src: lupineDrink, alt: "AH Lupine Drink, a lupin-based milk grown on Dutch soil" },
  { src: milsaSoja, alt: "Milsa Soja Drink, an unsweetened soy milk" },
  { src: campinaHaver, alt: "Campina Haver Drink oat milk" },
  { src: alproNotMilk, alt: "Alpro 'Shhh this is NOT M*LK' oat drink" },
  { src: sproudMilk2, alt: "Sproud unsweetened pea milk" },
  { src: beriefBarista, alt: "Berief Bio Barista plant milk" },
];
