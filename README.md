This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Core

- [x] constants: stock, foundation, tableau
- [x] handleSelection: 3 functions each bound to arg of constants
- [x] game state of ids
- [x] getCardById
- [x] Card type: id, suit, rank, faceUp, value (2-14), color (-1 / 1)
- [x] isMoveValid: (source, target) => boolean
- [x] selected(col, index) + slice selection in handleSelection

## Undo

forward:

- [ ] tableau to tableau (potential side effect: flip card)
- [ ] tableau to foundation (potential side effect: flip card)

- [ ] foundation to foundation
- [ ] foundation to tableau

- [ ] stock to tableau
- [ ] stock to foundation
- [ ] stock to stock
  - [ ] right to left: (transform: flip card)
  - [ ] left to right: (transform: flip all cards + reverse stack)

backward:

- [ ] tableau to tableau (potential side effect: flip card)
- [ ] tableau to stock
- [ ] tableau to foundation

- [ ] foundation to tableau (potential side effect: flip card)
- [ ] foundation to stock
- [ ] foundation to foundation

- [ ] stock to stock
  - [ ] right to left: (transform: flip all cards + reverse stack)
  - [ ] left to right: (transform: flip card)
