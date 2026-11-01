/* ================================================================
   THIS IS THE ONLY FILE YOU NEED TO EDIT
   ================================================================ */

const SHOP_NAME = "Swarnika";
const WHATSAPP_NUMBER = "917030226231";       // <-- replace with your WhatsApp business number
const SITE_URL = "https://swarnika.netlify.app"; 
const SLIDE_SECONDS = 3;                     
const PHOTO_SECONDS = 2;                     

const PRODUCTS = [
  { 
    id: "N-101", 
    name: "Temple Haram Necklace", 
    category: "Necklaces", 
    mrp: 1299, 
    price: 699, 
    images: ['/images/necklace01.jpg','/images/necklace02.jpg','/images/necklace03.jpg'], 
    desc: "Long haram with Lakshmi pendant. 1 gram gold plated.", 
    details: ["Length: 26 inches", "Weight: 52g", "Finish: Traditional Matte Gold"],
    badge: "Bestseller",
    inStock: true
  },
  { 
    id: "N-102", 
    name: "Kasu Mala Necklace", 
    category: "Necklaces", 
    mrp: 999, 
    price: 599, 
    images: ['/images/necklace04.jpg','/images/necklace05.jpg','/images/necklace06.jpg'], 
    desc: "Classic coin necklace for sarees. 1 gram gold plated.", 
    details: ["Length: 22 inches", "Coins: Lakshmi embossed"],
    badge: "",
    inStock: true
  },
  { 
    id: "N-103", 
    name: "Choker with Pearl Drops", 
    category: "Necklaces", 
    mrp: 849, 
    price: 499, 
    images: ['/images/necklace07.jpg','/images/necklace08.jpg','/images/necklace09.jpg'], 
    desc: "Short choker with pearl hangings. 1 gram gold plated.", 
    details: ["Adjustable dori rope included"],
    badge: "Trending",
    inStock: true
  },
  { 
    id: "E-201", 
    name: "Jhumka Earrings", 
    category: "Earrings", 
    mrp: 599, 
    price: 299, 
    images: ['/images/ear01.jpg','/images/ear02.jpg','/images/ear03.jpg'], 
    desc: "Traditional dome jhumkas. 1 gram gold plated.", 
    details: ["Closure: Push back"],
    badge: "Hot Deal",
    inStock: true
  },
  { 
    id: "E-202", 
    name: "Chandbali Earrings", 
    category: "Earrings", 
    mrp: 749, 
    price: 399, 
    images: ['/images/ear04.jpg','/images/ear05.jpg','/images/ear06.jpg'], 
    desc: "Crescent earrings with stone work. 1 gram gold plated.", 
    details: ["Semi-precious ruby/green kemp stones"],
    badge: "",
    inStock: true
  },
  { 
    id: "E-203", 
    name: "Stud Earrings Set of 3", 
    category: "Earrings", 
    mrp: 499, 
    price: 249, 
    images: ['/images/ear07.jpg','/images/ear08.jpg','/images/ear09.jpg'], 
    desc: "Everyday studs, three pairs. 1 gram gold plated.", 
    details: ["Set includes floral, round, and square studs"],
    badge: "",
    inStock: true
  },
  { 
    id: "B-301", 
    name: "Kada Bangles (Set of 2)", 
    category: "Bangles", 
    mrp: 1099, 
    price: 649, 
    images: ['/images/bangles01.jpg','/images/bangles02.jpg','/images/bangles03.jpg'], 
    desc: "Broad kada bangles, sizes 2.4 and 2.6. 1 gram gold plated.", 
    details: ["Openable screw lock mechanism"],
    badge: "Only 2 Left",
    inStock: true
  },
  { 
    id: "S-401", 
    name: "Bridal Necklace and Earring Set", 
    category: "Sets", 
    mrp: 2499, 
    price: 1299, 
    images: ['/images/sets01.jpg','/images/sets02.jpg','/images/sets03.jpg'], 
    desc: "Full set with matching earrings and maang tikka. 1 gram gold plated.", 
    details: ["Includes: Choker, Long Haram, Earrings & Maang Tikka"],
    badge: "Bridal Special",
    inStock: true
  }
];

const SLIDES = [
  { category: "Sets", title: "Bridal sets that finish the look", text: "Necklace, earrings and tikka, matched together.", theme: 1 },
  { category: "Necklaces", title: "Temple and kasu necklaces", text: "Traditional designs for sarees and festivals.", theme: 2 },
  { category: "Earrings", title: "Jhumkas, chandbalis and studs", text: "From everyday wear to wedding days.", theme: 3 },
  { category: "Bangles", title: "Kada bangles", text: "Broad, heavy-look bangles at light prices.", theme: 4 },
  { category: "All", title: "Festival offers on every piece", text: "Order on WhatsApp and pay by UPI.", theme: 5 }
];