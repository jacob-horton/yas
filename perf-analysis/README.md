
# Lighthouse Performance Runner

Runs Google Lighthouse multiple times against a URL and reports the average and standard deviation of key performance metrics.

---

## What it does

* Runs Lighthouse N times
* Supports authenticated pages via cookies
* Reports:

  * LCP (Largest Contentful Paint)
  * FCP (First Contentful Paint)
  * CLS (Cumulative Layout Shift)
  * TTI (Time to Interactive)
  * Speed Index
* Outputs mean and standard deviation

---

## Setup

Install dependencies:

```bash
pnpm install
pip install -r requirements.txt
```

Create your config:

```bash
cp .env.example .env
```

Edit `.env`:

```env
TARGET_URL=https://your-site.com/protected-page
SESSION_COOKIE=sessionid=your_cookie_here
RUNS=5
```

---

## Usage

```bash
python main.py
```

---

## Notes

* Lighthouse is installed locally and run via `pnpm exec`
* Results vary; multiple runs reduce noise
* If the session cookie is invalid, the tested page may be unauthenticated
