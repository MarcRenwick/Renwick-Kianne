/* =========================================================
   photos.js: THE ONLY FILE YOU NEED TO EDIT TO ADD PHOTOS
   =========================================================

   The gallery has 5 tabs: "All", "Memories", "Travels", "Foods", "Everyday".

   How to add a photo:
   1. Put the picture in the "images" folder and name it by category:
        memories1.jpg, memories2.jpg ...  -> shows under "Memories"
        travel1.jpg,   travel2.jpg ...    -> shows under "Travels"
        food1.jpg,     food2.jpg ...      -> shows under "Foods"
        everyday1.jpg, everyday2.jpg ...  -> shows under "Everyday"
   2. Make sure there is an entry below with the same filename. To add more,
      copy one of the entries and change it to match your photo:

      {
        src: "images/travel12.jpg",        // where the photo is
        caption: "Strawberry taho at 6am", // handwritten text under the photo
        date: "2019-12-28",                // YYYY-MM-DD (used for sorting)
        category: "Travels",               // "Memories", "Travels", "Foods" or "Everyday"
        location: "Baguio City"            // optional, you can delete this line
      },

   Tips:
   - Every entry ends with a comma "," except that the last one doesn't have to.
   - Filenames are case-sensitive once the site is online: "Travel1.JPG" and
     "travel1.jpg" are NOT the same file. Copy the name exactly.
   - "Travels" photos with the exact same location text are grouped into one
     stop on the travel route. Travels with an empty location are grouped
     together as "Somewhere new" until you fill it in.
   - Big phone photos make the page lag when scrolling. Resize them first so the
     longest side is about 1600px.
   - The captions, dates and locations below are placeholders. Change them
     to match your real photos.
*/

const PHOTOS = [
  /* =================== MEMORIES =================== */

  // ---- Photo 1 of 27: images/mcs.jpg ----
  {
    src: "images/mcs.jpg",
    caption: "Where it all began",                // <-- WRITE a short sentence for this photo
    date: "2021-10-1",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem Catholic School"       // <-- WHERE was it? (optional)
  },

  // ---- Photo 2 of 27: images/memories1.jpg ----
  {
    src: "images/memories1.jpg",
    caption: "JS PROM",                  // <-- WRITE a short sentence for this photo
    date: "2019-03-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem National High School"                                 // <-- WHERE was it? (optional)
  },

  // ---- New photo: images/memories2.jpg ----
  {
    src: "images/memories2.jpg",
    caption: "JS PROM",                           // <-- WRITE a short sentence for this photo
    date: "2023-03-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem National High School"  // <-- WHERE was it? (optional)
  },

  // ---- New photo: images/memories3.jpg ----
  {
    src: "images/memories3.jpg",
    caption: "JS PROM",                           // <-- WRITE a short sentence for this photo
    date: "2023-03-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem National High School"  // <-- WHERE was it? (optional)
  },

  // ---- New photo: images/2022.jpg ----
  {
    src: "images/2022.jpg",
    caption: "Senior high days",                  // <-- WRITE a short sentence for this photo
    date: "2022-06-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem National High School"  // <-- WHERE was it? (optional)
  },

  // ---- New photo: images/2022(1).jpg ----
  {
    src: "images/2022(1).jpg",
    caption: "Senior high days",                  // <-- WRITE a short sentence for this photo
    date: "2022-06-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Memories",
    location: "Mangatarem National High School"  // <-- WHERE was it? (optional)
  },


  /* =================== TRAVELS =================== */

  // ---- Photo 3 of 27: images/travel1.jpg ----
  {
    src: "images/travel1.jpg",
    caption: "Travel 1",                          // <-- WRITE a short sentence for this photo
    date: "2020-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 1"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 4 of 27: images/travel2.jpg ----
  {
    src: "images/travel2.jpg",
    caption: "Travel 2",                          // <-- WRITE a short sentence for this photo
    date: "2020-02-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 2"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 5 of 27: images/travel3.jpg ----
  {
    src: "images/travel3.jpg",
    caption: "Travel 3",                          // <-- WRITE a short sentence for this photo
    date: "2020-03-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 3"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 6 of 27: images/travel4.jpg ----
  {
    src: "images/travel4.jpg",
    caption: "Travel 4",                          // <-- WRITE a short sentence for this photo
    date: "2020-04-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 4"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 7 of 27: images/travel5.jpg ----
  {
    src: "images/travel5.jpg",
    caption: "Travel 5",                          // <-- WRITE a short sentence for this photo
    date: "2020-05-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 5"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 8 of 27: images/travel6.jpg ----
  {
    src: "images/travel6.jpg",
    caption: "Travel 6",                          // <-- WRITE a short sentence for this photo
    date: "2020-06-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 6"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 9 of 27: images/travel7.jpg ----
  {
    src: "images/travel7.jpg",
    caption: "Travel 7",                          // <-- WRITE a short sentence for this photo
    date: "2020-07-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 7"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 10 of 27: images/travel8.jpg ----
  {
    src: "images/travel8.jpg",
    caption: "Travel 8",                          // <-- WRITE a short sentence for this photo
    date: "2020-08-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 8"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 11 of 27: images/travel9.jpg ----
  {
    src: "images/travel9.jpg",
    caption: "Travel 9",                          // <-- WRITE a short sentence for this photo
    date: "2020-09-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 9"                          // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 12 of 27: images/travel10.jpg ----
  {
    src: "images/travel10.jpg",
    caption: "Travel 10",                         // <-- WRITE a short sentence for this photo
    date: "2020-10-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 10"                         // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- Photo 13 of 27: images/travel11.jpg ----
  {
    src: "images/travel11.jpg",
    caption: "Travel 11",                         // <-- WRITE a short sentence for this photo
    date: "2020-11-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Place 11"                         // <-- WHERE was it? (same name = same stop on the map)
  },

  // ---- New photo: images/travel12.jpg ----
  {
    src: "images/travel12.jpg",
    caption: "Travel 12",                         // <-- WRITE a short sentence for this photo
    date: "2025-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Baguio City"                      // <-- WHERE was it?
  },

  // ---- New photo: images/travel13.jpg ----
  {
    src: "images/travel13.jpg",
    caption: "Travel 13",                         // <-- WRITE a short sentence for this photo
    date: "2025-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Travels",
    location: "Baguio City"                      // <-- WHERE was it?
  },


  /* =================== FOODS =================== */

  // ---- Photo 14 of 27: images/food1.jpg ----
  {
    src: "images/food1.jpg",
    caption: "Food 1",                            // <-- WRITE a short sentence for this photo
    date: "2021-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 15 of 27: images/food2.jpg ----
  {
    src: "images/food2.jpg",
    caption: "Food 2",                            // <-- WRITE a short sentence for this photo
    date: "2021-02-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 17 of 27: images/food4.jpg ----
  {
    src: "images/food4.jpg",
    caption: "Food 4",                            // <-- WRITE a short sentence for this photo
    date: "2021-04-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 18 of 27: images/food5.jpg ----
  {
    src: "images/food5.jpg",
    caption: "Food 5",                            // <-- WRITE a short sentence for this photo
    date: "2021-05-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 19 of 27: images/food6.jpg ----
  {
    src: "images/food6.jpg",
    caption: "Food 6",                            // <-- WRITE a short sentence for this photo
    date: "2021-06-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 20 of 27: images/food7.jpg ----
  {
    src: "images/food7.jpg",
    caption: "Food 7",                            // <-- WRITE a short sentence for this photo
    date: "2021-07-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 21 of 27: images/food8.jpg ----
  {
    src: "images/food8.jpg",
    caption: "Food 8",                            // <-- WRITE a short sentence for this photo
    date: "2021-08-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 22 of 27: images/food9.jpg ----
  {
    src: "images/food9.jpg",
    caption: "Food 9",                            // <-- WRITE a short sentence for this photo
    date: "2021-09-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- New photo: images/food10.jpg ----
  {
    src: "images/food10.jpg",
    caption: "Strawberries!",                     // <-- WRITE a short sentence for this photo
    date: "2024-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },

  // ---- Photo 23 of 27: images/food_birthday1.jpg ----
  {
    src: "images/food_birthday1.jpg",
    caption: "Birthday treat",                    // <-- WRITE a short sentence for this photo
    date: "2021-10-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Foods"
  },


  /* =================== EVERYDAY =================== */

  // ---- Photo 24 of 27: images/everyday1.jpg ----
  {
    src: "images/everyday1.jpg",
    caption: "Everyday 1",                        // <-- WRITE a short sentence for this photo
    date: "2022-01-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Everyday"
  },

  // ---- Photo 25 of 27: images/everyday2.jpg ----
  {
    src: "images/everyday2.jpg",
    caption: "Everyday 2",                        // <-- WRITE a short sentence for this photo
    date: "2022-02-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Everyday"
  },

  // ---- Photo 26 of 27: images/everyday3.jpg ----
  {
    src: "images/everyday3.jpg",
    caption: "Everyday 3",                        // <-- WRITE a short sentence for this photo
    date: "2022-03-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Everyday"
  },

  // ---- Photo 27 of 27: images/everyday4.jpg ----
  {
    src: "images/everyday4.jpg",
    caption: "Everyday 4",                        // <-- WRITE a short sentence for this photo
    date: "2022-04-01",                          // <-- WHEN was it? YYYY-MM-DD
    category: "Everyday"
  }
];


/* =========================================================
   YEARS: what "Our Timeline" and "Our Travels" show
   =========================================================

   One entry per year, oldest first. Each year shows ONLY the photos you
   list in it. On "Our Travels" each year becomes one stop on the map.

      {
        year: "2027",                                 // the year badge
        place: "Somewhere new",                       // name of the stop on the map
        text: "One short sentence about this year.",  // shown once for the whole year
        photos: ["travel14.jpg", "food11.jpg"]        // filenames inside the images folder
      },

   Tips:
   - Write only the filename (no "images/" in front). Copy it exactly.
   - A photo can be in more than one year if you want.
   - To keep a year on "Our Timeline" but leave it off the "Our Travels" map,
     add this line to it:   showInTravels: false
*/

const YEARS = [
  {
    year: "2021",
    place: "Mangatarem Catholic School",                   // <-- WHERE
    text: "The year we met at Mangatarem Catholic School.", // <-- WRITE a short sentence
    photos: ["mcs.jpg"],
    showInTravels: false                                    // <-- Timeline only, not on the map
  },
  {
    year: "2022",
    place: "Mangatarem National High School",
    text: "Senior high together at Mangatarem National High School.",
    photos: ["2022.jpg", "2022(1).jpg"],
    showInTravels: false
  },
  {
    year: "2023",
    place: "JS Prom",
    text: "All dressed up for our JS Prom.",
    photos: ["memories1.jpg", "memories2.jpg", "memories3.jpg"],
    showInTravels: false
  },
  {
    year: "2024",
    place: "La Trinidad Strawberry Farm",
    text: "Picking strawberries in La Trinidad.",
    photos: ["travel4.jpg", "travel5.jpg", "travel6.jpg", "food10.jpg"]
  },
  {
    year: "2025",
    place: "Baguio City",
    text: "Cold air and long walks around Baguio City.",
    photos: ["travel7.jpg", "everyday1.jpg", "travel9.jpg", "travel12.jpg", "travel13.jpg"]
  },
  {
    year: "2026",
    place: "Anywhere",
    text: "Anywhere is home, as long as we're together.",
    photos: ["travel11.jpg", "travel10.jpg", "food_birthday1.jpg", "travel1.jpg", "travel2.jpg", "travel3.jpg", "travel8.jpg"]
  }
];
