export const metadata = {
  title: 'LifeStack Finance — BadgerBrain Intelligence Engine',
  description: 'Institutional-grade wealth analytics dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #f0f2f8; min-height: 100vh; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
