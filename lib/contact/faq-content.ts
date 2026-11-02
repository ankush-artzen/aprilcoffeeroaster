export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  description?: string;
  items: FaqItem[];
  /** Optional closing paragraph, rendered in italics below the items. */
  note?: string;
};

export const faqSections: FaqSection[] = [
  {
    "title": "My order –",
    "description": "Common questions about ordering, dispatch, and delivery.",
    "items": [
      {
        "question": "I just placed my order, when will it be dispatched?",
        "answer": "**Orders not containing coffee beans:**\nOrders that are not relying on our Roasting schedule and shipping with Fedex or DHL, usually ship in 1 or 2 business days.\n\n**Orders containing Coffee beans:**\nProduction is scheduled to occur every Tuesday & Wednesday. This means that if you have placed your order before 12:00 CEST on a Monday, your coffee will be roasted, packed and dispatched the following Tuesday of that week.\nIf your order is placed after 12:00 CEST on a Monday, your order will be carried over to the next subsequent production day. You will receive your tracking link via email once your order has been scheduled for production.\n\nNote that this is not relevant for subscription orders, please refer to the section below."
      },
      {
        "question": "Can I make changes to my order?",
        "answer": "• If you have recently placed an individual order using our webstore, and the order has been confirmed, you will not be able to edit or amend this order. To make any desired changes, we must cancel your existing order and place a new order using your updated terms. Note that if you wish to cancel your order, you need to do it at the latest on the 48h before we fulfil it the following Monday.\n\n• If your order has already shipped, we are unable to cancel and refund the order.\n\n• Subscribers can easily modify their subscription by logging into their account and visiting the \"Subscriptions\" section of the dashboard. There, you can adjust settings like quantity, variety, or shipping preferences. Please note that any changes will only apply to future orders processed after the updates are made. Be sure to check your charge date to ensure the changes apply to the correct order."
      },
      {
        "question": "I received my order and it's incorrect",
        "answer": "If you receive your parcel and an item is missing, please reach out to us with the order number, we will offer two solutions:\n• Reship the missing product (if in stock)\n• A refund for the missing item"
      },
      {
        "question": "Invoice & VAT request",
        "answer": "If you need an invoice, please reach out to us and we will provide it.\n\nPlease note that we only provide VAT free invoices to our registered wholesale customers."
      },
      {
        "question": "Damaged item",
        "answer": "• If you receive a piece of equipment that has been damaged during transport and is unusable, we will ship it again or offer a refund. This does not concern the packaging/outer box.\n\n• If you receive a box of coffee that is damaged but the bag of coffee itself has not been damaged (ripped, open or pierced), we do not offer further support.\n\n• For all pieces of equipment, we do not offer replacement for regular wear & tear or if you or anyone else inflicted damages, however if you see anything that does not seem normal please reach out to us with a picture and we will offer a replacement."
      },
      {
        "question": "Missing details on the location of your package",
        "answer": "When shipped with Postnord, your **local postal service** will handle the package once it reaches your country. You can track it on their website using the same Postnord tracking ID, which is often more accurate and detailed than the Postnord app."
      },
      {
        "question": "Package delivered to a third party",
        "answer": "If you package is \"Delivered\" but you did not receive it, we will kindly ask you to try to reach out to the carrier so that they can identify the person and see if you can retrieve the package. If you are unable to retrieve the package, contact us."
      },
      {
        "question": "Items purchased via our resellers/Third Parties",
        "answer": "All sales made through our resellers are subject to their own Terms & Conditions.\nSince the product was not purchased via our website, we are not able to offer support. However you can reach out to us if you have a doubt and we can try to answer your questions as much as we can."
      }
    ]
  },
  {
    "title": "Shipping –",
    "description": "Addresses concerns about lost packages and delivery times",
    "items": [
      {
        "question": "Duties & Taxes",
        "answer": "• If your parcel is stopped at customs and needs extra paperwork, please reach out to us and we will provide the paperwork to you.\n• We do not take responsibility for any import fees or additional charges that might apply on your package once it has been dispatched.\n• If you refuse your package because extra duties were applied by the country of destination, we will not refund the order."
      },
      {
        "question": "Do you ship to my country?",
        "answer": "We offer a variety of international shipping options worldwide, from cost-effective services to express deliveries. To see what options are available, go to checkout."
      },
      {
        "question": "Postnord Delivery Estimated Times",
        "answer": "Note that all packages shipped with postnord will be handled by your local postal services.\n\nFor example, Postnord in Denmark will become USPS in the US, La Poste in France, Royal mail in the UK etc.\nWe recommend you track your shipment via their respective website using the same tracking ID, this will give you a better and more detailed tracking.\n\nDenmark: 1-5 business days\nEU: 5-14 business days\nNorth America: 10-14 business days\nAustralia: 10-21 business days\nSouth East Asia: 10-21 business days\nChina & HK: 7-14 business days\n\nPlease note that transit times are **estimates**, that can be affected by local events like Bank Holidays, or internal postal delays.\nWe are not responsible for any delay that might occur once your package is handed over to the postal services, and we are not able to offer more support on that as we only have access to the same tracking infos as you have.\n\n**For more detailed updates on your package's location, please contact the local postal services directly.**"
      },
      {
        "question": "My package is not moving or lost",
        "answer": "• When shipped with Postnord, your local postal service will handle the package once it reaches your country. You can track it on their website using the same Postnord tracking ID, which is often more accurate and detailed than via Postnord.\n• If the status of your package is \"registered\" for over a week since fulfillment please reach out to us, we will investigate and reship if necessary. If it has been a few days only, it is normal.\n• If the package has been received by the carrier and is blocked in transit, reach out to the carrier, as we are not able to offer further support on locating the package.\n• If past **30 days** your order has still not arrived, please reach out to us and we will offer a replacement or a refund."
      },
      {
        "question": "More infos on the location of your package",
        "answer": "When shipped with Postnord, your local postal service will handle the package once it reaches your country. You can track it on their website using the same Postnord tracking ID, which is often more accurate and detailed than with the Postnord app."
      },
      {
        "question": "Can I pick my order at one of your Showrooms?",
        "answer": "It is **not possible** to pick orders up at our stores, as they are not equipped to hold and manage packages."
      }
    ]
  },
  {
    "title": "My Subscription –",
    "description": "Answers all subscription-related queries",
    "items": [
      {
        "question": "Unable to log in my account",
        "answer": "If you are having trouble logging in, it may be because you do not have an account and need to create one.\n\n**Having an active subscription does not automatically create an account on our website, you have to create one yourself.**"
      },
      {
        "question": "When is my subscription shipped?",
        "answer": "All subscriptions are produced the first tuesday of the month. This means that your order will be awaiting fulfillment from the 15th to the shipping date, regardless of when you create it.\nWe are dispatching the shipments Tuesday/Wednesday and Thursday.\nNote that Postnord can take a few days before scanning the packages."
      },
      {
        "question": "Can i pick up my subscription at your Showroom?",
        "answer": "It is **not possible** to pick orders up at our stores, as they are not equipped to hold and manage packages."
      },
      {
        "question": "What can I expect from the April Subscription?",
        "answer": "• If you order more than one bag of coffee in an April Selection Subscription, you will get different coffees.\n\n• We produce your first subscription order the first Tuesday of the month. The next withdrawal will be on the 15th - regardless of when you placed the order.\n\n• Every month you will receive a personal email from our founder that details information about Green Coffee, Roasting and Brewing of the main coffee of the month.\n\n• As we purchase all of our coffee direct - not from importers - we sometimes have repeating coffees over the year. And you will receive many different varietals and processing methods from the same farm. If you also have more than 4 boxes in your subscription, you might receive duplicates depending on our current offering.\n\n**Before you Subscribe, please note that regardless of when you subscribe you will be charged again on the 15th. So, if you want to avoid to be charged twice in your first month. Please place your order after the 15th.**"
      },
      {
        "question": "Can I pause or cancel my subscription?",
        "answer": "Are you going on vacation? Perhaps you have too much coffee and would like to pause your deliveries for a short while? No problem, no need to cancel your subscription. It’s much easier and convenient to skip one or more of your scheduled shipments.\n\nIf you haven’t already accessed it, log in to your account. Head on over to the Subscriptions section of your account dashboard and click the ‘Pause Subscription’ or \"cancel Subscription\" link.\n\n**Having a subscription does not automatically create an account**, so if you are struggling to log in, it is because you do not have an account yet."
      },
      {
        "question": "Can I choose the coffee in my subscription?",
        "answer": "No, it is not possible to choose which coffees you will get in your shipment.\nIf you have a April Selection subscription with multiple bags, each of them will be different*, to the extend of our offerlist.\n\n*if you have 4+ bags in your April Selection subscription, you will receive duplicates depending on our offerlist."
      },
      {
        "question": "Can i add anything to my next shipment?",
        "answer": "Yes, you can add other items to your subscription in \"manage my subscription\". This will add the desired product to your next shipment.\nThis needs to be made before the renewal. It can also affect the shipping price, if that is the case contact us and we will refund the difference."
      },
      {
        "question": "The shipping was more expensive than usual.",
        "answer": "If for some reason you are assigned a shipping rate is more expensive than usual, please write to us and we will refund the difference."
      },
      {
        "question": "Wrong shipping rate",
        "answer": "If the shipping rate on your order is wrong, we are not able to change it on your active subscription, you need to cancel and remake a new subscription using the shipping rate that you desire."
      }
    ]
  },
  {
    "title": "Brewing April",
    "description": "Focuses on any coffee-related questions. If you can't find the information you need, feel free to reach out using the form below",
    "items": [
      {
        "question": "How should I brew my coffee?",
        "answer": "You will find the recipes and informations for each of our coffees [here](/coffee-inf-recipes).\n\nPlease note those recipes are based on what we serve in our Store, they might need time to be updated after the release of a new coffee. As we understand that our Store's setup is professional, you are welcome to use these recipes as a guide, and tune your equipment to achieve your perfect cup.\n\nWe are not able to give tailored recipes based on your equipment."
      },
      {
        "question": "Special recipes - particule size, water composition etc.",
        "answer": "- We use a reverse osmosis system, with a BPM usually between 20 and 50. We do not measure the exact composition of our water so we are not able to share that with you.\n\n- We are aware that not everyone has the same set up and our recipes might not be fully relevant to everyone. Unfortunately we are not able to offer solutions tailored to everyone's set up, as we might not use the same equipment as you are. Nonetheless, we trust that you are able to find your perfect recipe and get the most out of each cup.\n\n- We do not measure the particule size in our recipes, so we are not able to share these."
      },
      {
        "question": "Resting your coffee",
        "answer": "We recommend you let your beans rest for **at least 14 days** before brewing, this is what we use in our store and roastery, and we find that this way it offers a way better flavor clarity and balance in the cup.\n\nFor more details, check out our [Youtube channel](https://www.youtube.com/channel/UCPlsOYZ8ZEam57EUCf3DKjg), where we talk about brewing techniques and the coffees of our lineup."
      }
    ]
  }
];

export const contactIntro =
  "Before contacting us, please make sure to check our FAQ to find your answer.";

export const customerServiceHours = {
  title: "Opening hours for our customer service:",
  open: "Open: MON - WED - THU - FRI",
  closed: "Closed: Tuesday, Saturday & Sunday, as well as all public Holidays.",
  notes: [
    "Please keep in mind that response times may vary based on the volume of requests. We appreciate your patience and are always happy to assist with your inquiries.",
    "Please note that we do not provide customer service through social media or our showrooms for online purchases; you will be redirected to this page automatically.",
    "We are here to help, but please remember that customers who communicate with our service team in an impolite manner will be banned from purchasing our products.",
  ],
} as const;

export const contactFormNotice =
  "Before sending your message, make sure your question is not answered in the FAQ above.";

export const CONTACT_TO_EMAIL = "support@aprilcoffeeroastery.freshdesk.com";
