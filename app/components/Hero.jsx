'use client'
import Image from 'next/image';

const Hero = () => {
  return (
    <div className="relative min-h-[calc(100vh-72px)] m-[1.5rem] rounded-xl overflow-hidden">
      {/* SVG Background */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        <Image
          src="/images/hero.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="block md:hidden absolute inset-0 w-full h-full">
        <Image
          src="/images/hero-mobile.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Layer (z-index 10) */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center h-full">
        <div className="text-white w-full mb-8 md:mb-0">

          <h1 className="hero-text md:hero-text-mobile text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Not getting orders <br />
            on Upwork and <br />
            fiverr ?
          </h1>

          <button className="bg-teal-400 mt-4 text-black font-semibold px-6 py-3 rounded-md hover:bg-teal-500 hover:text-white transition-colors cursor-pointer">
            Join Now
          </button>
        </div>

        <div className="w-full md:w-1/2">
          {/* This div is intentionally left empty as the background image is now the hero.svg */}
        </div>
      </div>

      {/* Wave Shape - keeping this in case it's needed as an overlay */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;