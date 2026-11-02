export type CoffeeInfoPhoto = {
  /** Thumbnail / strip preview */
  src: string;
  /** Larger image for lightbox (falls back to src) */
  fullSrc: string;
  alt: string;
};

export type CoffeeInfoVideo = {
  url: string;
  title: string;
  provider: string;
  providerUid: string;
  thumbnailUrl: string | null;
};

export type CoffeeInfoCoffee = {
  name: string;
  recipeFilter: string;
  recipeEspresso: string;
  lotInformation: string;
};

export type CoffeeInfoFarm = {
  slug: string;
  /** Display title, e.g. "VOLCAN AZUL" */
  title: string;
  description: string;
  /** Free-form text for General Information accordion. */
  generalInformation: string;
  photos: CoffeeInfoPhoto[];
  /** DatoCMS External Video (`video_url`), typically YouTube. */
  video: CoffeeInfoVideo | null;
  coffees: CoffeeInfoCoffee[];
};

export const coffeeInfoPageIntro =
  "Brewing guides, farm information, and recipes for the coffees we currently work with.";

/** Coffee purchasing philosophy, shown above BREWING APRIL. */
export const coffeeInfoPurchasingSection = {
  title: "THE APRIL RULES OF COFFEE PURCHASING",
  items: [
    {
      question: "01 DIRECT TRADE",
      answer:
        "We purchase directly from our partner farmers, building relationships season after season.",
    },
    {
      question: "02 FARMER-LED PRICING",
      answer:
        "The farmer decides the price and payment terms. It's that simple.",
    },
    {
      question: "03 QUALITY, TOGETHER",
      answer:
        "We define quality together through tasting, dialogue and clear expectations. April and the partner farmer agree on a clear range of quality acceptance before purchasing. We also agree in advance on how to handle unexpected quality issues, including problems that may occur at origin, without placing the financial risk on the farmer.",
    },
    {
      question: "04 SINGLE FARMER PROJECTS",
      answer:
        "We focus on individual farmers, their farms and their coffees rather than cooperative structures. This allows us to maintain full traceability of every coffee we purchase.",
    },
    {
      question: "05 WE ALWAYS COME BACK",
      answer:
        "Our intention is always to return the following season and continue building together. We are proud that the vast majority of our partner farmers have worked with us through both good and challenging seasons since we started our direct trade program in 2019.",
    },
    {
      question: "06 LOGISTICAL PARTNER",
      answer:
        "We trade all our coffees with the support of a logistical partner. If a quality issue arises on arrival, April, the partner farmer and our logistical partner work together to find a solution without placing the farmer at financial risk.",
    },
    {
      question: "07 #GROWINGTOGETHER",
      answer:
        "We believe long-term relationships, shared progress and shared responsibility lead to better coffee.",
    },
  ],
  note: "There are exceptions when we begin a new relationship and initially source the coffee through an importer. Our current relationship with Kayon Mountain in Ethiopia is one example. We are at the beginning of that journey, with Café Imports facilitating the process. In these cases, we still maintain direct contact and build a relationship with the farmer. And if a farmer prefers to continue working through an importer—not every farmer wants to trade directly—we respect and support that choice.",
} as const;

/** FAQ-style intro block shown above the farm list (same pattern as Get in Contact). */
export const coffeeInfoBrewingSection = {
  title: "BREWING APRIL",
  description:
    "Focuses on any coffee-related questions. If you can't find the information you need, feel free to reach out using the form below",
  items: [
    {
      question: "How should I brew my coffee?",
      answer:
        "You will find the recipes and informations for each of our coffees [here](#farms).\n\nPlease note those recipes are based on what we serve in our Store, they might need time to be updated after the release of a new coffee. As we understand that our Store's setup is professional, you are welcome to use these recipes as a guide, and tune your equipment to achieve your perfect cup.\n\nWe are not able to give tailored recipes based on your equipment.",
    },
    {
      question: "Special recipes - particle size, water composition etc.",
      answer:
        "- We use a reverse osmosis system, with a PPM usually between 25 and 50. We do not measure the exact composition of our water so we are not able to share that with you.\n\n- We are aware that not everyone has the same set up and our recipes might not be fully relevant to everyone. Unfortunately we are not able to offer solutions tailored to everyone's set up, as we might not use the same equipment as you are. Nonetheless, we trust that you are able to find your perfect recipe and get the most out of each cup.\n\n- We do not measure the particle size in our recipes, so we are not able to share these.",
    },
    {
      question: "Resting your coffee",
      answer:
        "We recommend you let your beans rest for **at least 14 days** before brewing, this is what we use in our store and roastery, and we find that this way it offers a way better flavor clarity and balance in the cup.\n\nFor more details, check out our [Youtube channel](https://www.youtube.com/channel/UCPlsOYZ8ZEam57EUCf3DKjg), where we talk about brewing techniques and the coffees of our lineup.",
    },
  ],
} as const;
