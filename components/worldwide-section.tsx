"use client";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { GlobeMarker } from "@/components/ui/3d-globe";
import { fadeUp, scaleUp, viewport } from "@/lib/animations";
import { Package, Truck, ShieldCheck, Clock } from "lucide-react";

// Lazy-load the heavy 3D canvas — avoids SSR issues with WebGL
const Globe3D = dynamic(
  () => import("@/components/ui/3d-globe").then((m) => m.Globe3D),
  { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center text-amber-400 text-sm">Loading globe...</div> }
);

const MARKERS: GlobeMarker[] = [
  { lat: 40.7128,  lng: -74.006,   src: "https://assets.aceternity.com/avatars/1.webp",  label: "New York" },
  { lat: 51.5074,  lng: -0.1278,   src: "https://assets.aceternity.com/avatars/2.webp",  label: "London" },
  { lat: 35.6762,  lng: 139.6503,  src: "https://assets.aceternity.com/avatars/3.webp",  label: "Tokyo" },
  { lat: -33.8688, lng: 151.2093,  src: "https://assets.aceternity.com/avatars/4.webp",  label: "Sydney" },
  { lat: 48.8566,  lng: 2.3522,    src: "https://assets.aceternity.com/avatars/5.webp",  label: "Paris" },
  { lat: 28.6139,  lng: 77.209,    src: "https://assets.aceternity.com/avatars/6.webp",  label: "New Delhi" },
  { lat: 55.7558,  lng: 37.6173,   src: "https://assets.aceternity.com/avatars/7.webp",  label: "Moscow" },
  { lat: -22.9068, lng: -43.1729,  src: "https://assets.aceternity.com/avatars/8.webp",  label: "Rio de Janeiro" },
  { lat: 31.2304,  lng: 121.4737,  src: "https://assets.aceternity.com/avatars/9.webp",  label: "Shanghai" },
  { lat: 25.2048,  lng: 55.2708,   src: "https://assets.aceternity.com/avatars/10.webp", label: "Dubai" },
  { lat: 1.3521,   lng: 103.8198,  src: "https://assets.aceternity.com/avatars/12.webp", label: "Singapore" },
  { lat: 37.5665,  lng: 126.978,   src: "https://assets.aceternity.com/avatars/13.webp", label: "Seoul" },
];

const STATS = [
  { icon: Package,    value: "50K+",  label: "Orders Delivered" },
  { icon: Truck,      value: "120+",  label: "Countries Reached" },
  { icon: ShieldCheck,value: "99.8%", label: "On-Time Delivery" },
  { icon: Clock,      value: "24h",   label: "Avg. Processing" },
];

export function WorldwideSection() {
  return (
    <section className="relative bg-[#1a0a02] overflow-hidden py-16 md:py-24">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-30"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right,#2a1005 1px,transparent 1px),linear-gradient(to bottom,#2a1005 1px,transparent 1px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={fadeUp} custom={0}
        >
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-widest">
            Global Reach
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-amber-50 mt-3 leading-tight">
            We Ship Worldwide
          </h2>
          <p className="text-amber-200/60 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            From New York to Tokyo, London to Dubai — your order reaches you
            wherever you are. Trusted by customers in over 120 countries.
          </p>
        </motion.div>

        {/* Globe */}
        <div className="relative">
          <Globe3D
            markers={MARKERS}
            className="h-[420px] md:h-[520px]"
            config={{
              autoRotateSpeed: 0.4,
              showAtmosphere: true,
              atmosphereColor: "#b45309",
              atmosphereIntensity: 0.4,
              atmosphereBlur: 3,
              bumpScale: 4,
              enableZoom: false,
              ambientIntensity: 0.5,
              pointLightIntensity: 1.8,
            }}
          />
          {/* Fade edges into background */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_50%,#1a0a02_100%)]" />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              className="text-center"
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={scaleUp} custom={i * 0.1}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-800/30 border border-amber-700/30 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-amber-300">{value}</p>
              <p className="text-amber-200/50 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
