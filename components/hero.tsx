import { ArrowRight } from "lucide-react";

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

export function Hero() {
  return (
    <>
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="relative z-20 flex flex-col items-center text-center pt-[90px] md:pt-[120px] px-5 sm:px-8">
        <h1
          className="text-white font-normal leading-[1.12] tracking-tight max-w-3xl text-balance"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.6rem)",
          }}
        >
          Where precision finds its edge
          <br className="hidden sm:block" /> and vision rewrites what comes next
        </h1>

        <p className="mt-5 md:mt-6 text-white/60 text-sm md:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-md font-mono">
          a seamless bridge - where raw ambition
          <br className="hidden sm:block" /> and machine clarity converge as one
        </p>

        <button className="mt-7 md:mt-8 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium transition-all duration-300 hover:opacity-80 group">
          Watch it unfold
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
    </>
  );
}
