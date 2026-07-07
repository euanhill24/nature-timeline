# UK Nature Almanac

A scroll‑through almanac of the British natural year. Scroll from January to December and watch what's happening outside change month by month — the wildlife to look for, what's in bloom, what's in season at the market, and what's in the night sky — while the colours of the page shift from winter greys through spring greens to autumn russets.

It's meant to feel like a beautifully printed field almanac brought to life with a bit of motion, rather than a database you search.

## What's in it

Each month has six sections: **Nature Events**, **Wildlife**, **Sky** (moon phases, meteor showers, daylight), **Seasonal Vegetables**, **Foraging & Plants in bloom**, and **Things To Do**. Content is drawn from UK sources like the Wildlife Trusts, Woodland Trust, RSPB and RHS.

> January, April and October are fully written (winter, spring and autumn); the remaining months are scaffolded and being filled in over time.

## Built with

Plain HTML, CSS and vanilla JavaScript — no build step — with [GSAP](https://gsap.com/) + ScrollTrigger driving the scroll animations and seasonal colour transitions. All the content lives in [`data/months.json`](data/months.json). Designed to be hosted on GitHub Pages.

## Running locally

It fetches `data/months.json`, so open it through a local server rather than straight off the file system:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
