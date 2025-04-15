import Head from 'next/head';
import Hero from './components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Freelancer Platform</title>
        <meta name="description" content="Find work or hire talent" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Hero />
    </div>
  );
}