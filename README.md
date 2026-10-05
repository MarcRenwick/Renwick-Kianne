# Renwick & Kianne Cher-Rylle

Our photo journal: memories, travels and everyday moments.
Plain HTML, CSS and JavaScript. No frameworks, no build step.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page structure (all 8 sections) |
| `style.css` | Colors, fonts, layout and animations |
| `script.js` | Builds the sections from the photo list and runs the animations |
| `photos.js` | **The list of photos.** This is the file you edit most |
| `images/` | Put your photos here |
| `images/backgrounds/` | The two background photos (behind the names, and in Our Story) |

## Add a photo

1. Copy the photo into `images/`, for example `images/baguio-2019.jpg`.
2. Open `photos.js` and add an entry (copy an existing one):

   ```js
   {
     src: "images/baguio-2019.jpg",
     caption: "Strawberry taho at 6am",
     date: "2019-12-28",
     category: "Travels",          // "Memories", "Travels", "Foods" or "Everyday"
     location: "Baguio City"       // optional
   },
   ```

3. Save and refresh the page.

The gallery, filters, timeline, travel route, film strip and closing photo all update automatically.

## Change the background photos

- `images/backgrounds/hero.webp`: the blurred photo behind our names
- `images/backgrounds/story.webp`: the faded photo on the right of "Our Story"

To use a different photo, replace the file and keep the same name. Or put a `.jpg` in that
folder and change the file name in `style.css` (search for `backgrounds/`).
Keep each one under 300 KB so the page loads fast on phones.

## Change the "days together" date

At the top of `script.js`, change `TOGETHER_SINCE` to your real date (YYYY-MM-DD).

## Preview on your computer

Double-click `index.html`. It opens in your browser, no server needed.

## Put it online

**GitHub Pages**
1. Create a new repository on GitHub and upload all these files (keep `index.html` at the top level).
2. Go to **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
3. After a minute your site is live at `https://<your-username>.github.io/<repository-name>/`.

**Vercel**
1. Push the files to a GitHub repository (as above).
2. On vercel.com, click **Add New → Project**, import the repository.
3. Framework preset: **Other**. Leave the build command empty. Click **Deploy**.

> Online, filenames are case-sensitive: `Photo.JPG` and `photo.jpg` are different files.
> If a photo doesn't show, the page displays the path it couldn't find.
