This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Brand Fonts (PEDRO & CHARLES & KEITH)

The Indonesian PEDRO Women Bags page relies on an Adobe Fonts kit (`https://use.typekit.net/vfa3pfk.css`) that exposes **Proxima Nova** (sans) and **Cormorant Garamond** (serif). CHARLES & KEITH uses another Adobe Fonts kit (`https://use.typekit.net/exv2fdk.css`) that serves **Futura PT** (regular and bold weights).

These kits are imported globally from `app/globals.css`, and the project now exposes four utilities so you can opt into the exact brand stacks anywhere in the UI:

- `font-pedro-sans` → Proxima Nova stack
- `font-pedro-serif` → Cormorant Garamond stack
- `font-ck-sans` → Futura PT stack
- `font-ck-bold` → Futura PT bold stack

> ℹ️ The Adobe kits belong to the respective brands. They work for local development, but using them in production requires that your domain is whitelisted in your own Adobe Fonts account or that you self-host licensed font files.

### Google Fonts availability

Only **Cormorant Garamond** is offered on Google Fonts. It is loaded via `next/font/google` inside `app/layout.tsx`, exposing the `--font-cormorant-garamond` variable that backs the `font-pedro-serif` utility. **Proxima Nova** and **Futura PT** are not in Google Fonts, so they still rely on the Adobe kits (or a separately licensed/self-hosted build).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
