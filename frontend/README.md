This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local setup

1. Install dependencies:

```bash
cd school_management/frontend
npm install
```

2. Add your contract addresses to `.env.local`:

```bash
NEXT_PUBLIC_STUDENT_CONTRACT_ADDRESS=0xYourStudentContractAddress
NEXT_PUBLIC_STAFF_CONTRACT_ADDRESS=0xYourStaffContractAddress
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- MetaMask wallet connect
- Student registration
- School fee payment
- Staff registration
- Attendance recording
- Real-time contract data and status

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
