'use client'

import { motion } from 'motion/react'
import { SparklesCore } from '@/components/ui/sparkles'
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation'
import { Button as MovingBorderButton } from '@/components/ui/moving-border'
import { CtaButton } from '@/components/ui/cta-button'
import { fadeUp, fadeLeft, fadeRight, fadeIn, scaleUp, viewport } from '@/lib/animations'
import {
  ShieldCheck, Truck, RefreshCw, HeadphonesIcon,
  Star, Package, Users, Globe, ArrowRight, CheckCircle,
} from 'lucide-react'

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products' },
  { value: '99%',  label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Customer Support' },
]

const VALUES = [
  { icon: ShieldCheck,    title: 'Secure Shopping',  description: "Every transaction is protected by bank-grade encryption and Stripe's industry-leading payment infrastructure. Your data is never stored on our servers." },
  { icon: Truck,          title: 'Fast Delivery',    description: 'We partner with top logistics providers to get your orders to your door quickly. Track your shipment in real time from the moment it leaves our warehouse.' },
  { icon: RefreshCw,      title: '30-Day Returns',   description: 'Not satisfied? Return any item within 30 days for a full refund — no questions asked. We make the process simple and hassle-free.' },
  { icon: HeadphonesIcon, title: 'Expert Support',   description: 'Our team is available around the clock to help with anything from product questions to order issues. Real humans, real answers.' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.',  role: 'Verified Buyer', rating: 5, text: 'Absolutely love this store. The checkout was seamless, delivery was faster than expected, and the product quality exceeded my expectations.' },
  { name: 'James K.',  role: 'Verified Buyer', rating: 5, text: 'I was skeptical at first but the customer support team resolved my query within minutes. Will definitely be shopping here again.' },
  { name: 'Priya L.',  role: 'Verified Buyer', rating: 5, text: 'The return process was incredibly smooth. Got my refund in two days. This is how online shopping should work.' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse & Discover', description: 'Explore thousands of curated products across every category. Filter by price, rating, or category to find exactly what you need.' },
  { step: '02', title: 'Add to Cart',       description: 'Save items to your wishlist or add them directly to your cart. Your cart is saved across sessions so you never lose your picks.' },
  { step: '03', title: 'Secure Checkout',   description: 'Enter your shipping details and pay securely with your card via Stripe. Your payment information is encrypted end-to-end.' },
  { step: '04', title: 'Track & Receive',   description: 'Get an order confirmation instantly. Track your order status from your account dashboard until it arrives at your door.' },
]

const MISSION_POINTS = [
  'Curated catalog — every product vetted by our team',
  'Transparent pricing — no hidden fees at checkout',
  'Ethical sourcing — we care about where products come from',
  'Community first — your feedback shapes what we stock',
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section
        className="relative h-[40rem] w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2c1008 0%, #451a03 40%, #78350f 100%)' }}
      >
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore background="transparent" minSize={0.4} maxSize={1.2} particleDensity={600} className="w-full h-full" particleColor="#fbbf24" />
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(180,83,9,0.35) 0%, transparent 70%)' }} />
        <div className="absolute inset-x-0 top-1/2 -translate-y-8 flex flex-col items-center pointer-events-none">
          <div className="w-[40rem] max-w-full relative h-12">
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent h-px w-1/4" />
          </div>
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(28,10,2,0.7) 100%)' }} />

        <motion.div
          className="relative z-20 text-center px-4 md:px-6 max-w-4xl mx-auto"
          initial="hidden" animate="visible" variants={fadeUp}
          custom={0}
        >
          <motion.span
            className="inline-block bg-amber-900/50 text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase border border-amber-700/40"
            variants={fadeIn} custom={0.1}
          >
            About Us
          </motion.span>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-amber-50 leading-tight mb-6"
            variants={fadeUp} custom={0.2}
          >
            Shopping Reimagined for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
              Modern World
            </span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-amber-200/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            variants={fadeUp} custom={0.35}
          >
            We built this store because great products should be easy to find,
            simple to buy, and backed by a team that genuinely cares about your experience.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full max-w-sm sm:max-w-none mx-auto"
            variants={fadeUp} custom={0.5}
          >
            <CtaButton href="/" variant="primary">
              <span className="inline-flex items-center justify-center gap-2">Shop Now <ArrowRight size={16} /></span>
            </CtaButton>
            <CtaButton href="/auth/sign-up" variant="outline">Create Free Account</CtaButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden" whileInView="visible" viewport={viewport}
                variants={fadeUp} custom={i * 0.1}
              >
                <p className="text-4xl md:text-5xl font-extrabold text-amber-800 mb-2">{stat.value}</p>
                <p className="text-stone-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left text — slides in from left */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeLeft} custom={0}
          >
            <span className="text-amber-800 font-semibold text-sm uppercase tracking-widest">Our Mission</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3 mb-6 leading-tight">
              Making Quality Products Accessible to Everyone
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We started with a simple idea: the best online shopping experience should be available to everyone,
              not just those who know where to look. We hand-pick every product in our catalog, negotiate directly
              with suppliers, and pass the savings on to you.
            </p>
            <p className="text-stone-600 leading-relaxed mb-8">
              From electronics to home goods, clothing to books — every item meets our quality bar before it ever
              appears on our shelves. We stand behind everything we sell.
            </p>

            {/* 4 bullet points — each slides in from left with staggered delay */}
            <ul className="space-y-4">
              {MISSION_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  className="flex items-start gap-3 text-stone-700"
                  initial="hidden" whileInView="visible" viewport={viewport}
                  variants={fadeLeft} custom={i * 0.12}
                >
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={viewport}
                    transition={{ duration: 0.4, delay: i * 0.12, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle size={20} className="text-amber-700 mt-0.5 shrink-0" />
                  </motion.span>
                  <span className="font-medium">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right icon cards — slide in from right */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeRight} custom={0.15}
          >
            {[
              { icon: Package, label: 'Curated Products',   borderClass: 'bg-[radial-gradient(#92400e_40%,transparent_60%)]', duration: 8000 },
              { icon: Globe,   label: 'Worldwide Shipping', borderClass: 'bg-[radial-gradient(#78350f_40%,transparent_60%)]', duration: 10000 },
              { icon: Users,   label: 'Growing Community',  borderClass: 'bg-[radial-gradient(#b45309_40%,transparent_60%)]', duration: 9000 },
              { icon: Star,    label: 'Top Rated Store',    borderClass: 'bg-[radial-gradient(#d97706_40%,transparent_60%)]', duration: 7000 },
            ].map(({ icon: Icon, label, borderClass, duration }, i) => (
              <motion.div key={label} variants={scaleUp} custom={i * 0.1}>
                <MovingBorderButton
                  as="div" duration={duration} borderRadius="1rem"
                  borderClassName={borderClass} containerClassName="h-32 w-full"
                  className="flex flex-col items-center justify-center gap-2 bg-amber-50 border-amber-200 text-stone-800"
                >
                  <Icon size={28} className="text-amber-800" />
                  <p className="font-semibold text-xs text-center">{label}</p>
                </MovingBorderButton>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-amber-100/60 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeUp} custom={0}
          >
            <span className="text-amber-800 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3">Built Around Your Experience</h2>
            <p className="text-stone-500 mt-4 max-w-xl mx-auto">
              Every decision we make starts with one question: does this make shopping better for our customers?
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, description }, i) => {
              const borders = [
                'bg-[radial-gradient(#92400e_40%,transparent_60%)]',
                'bg-[radial-gradient(#b45309_40%,transparent_60%)]',
                'bg-[radial-gradient(#d97706_40%,transparent_60%)]',
                'bg-[radial-gradient(#78350f_40%,transparent_60%)]',
              ]
              const durations = [9000, 11000, 8000, 12000]
              return (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="visible" viewport={viewport}
                  variants={fadeUp} custom={i * 0.12}
                >
                  <MovingBorderButton
                    as="div" duration={durations[i]} borderRadius="1rem"
                    borderClassName={borders[i]} containerClassName="h-auto w-full"
                    className="flex flex-col items-start bg-amber-50 border-amber-200 text-stone-800 p-6"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
                      <Icon size={24} className="text-amber-800" />
                    </div>
                    <h3 className="font-bold text-stone-900 mb-3 text-left">{title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed text-left">{description}</p>
                  </MovingBorderButton>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <motion.div
          className="text-center mb-16"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={fadeUp} custom={0}
        >
          <span className="text-amber-800 font-semibold text-sm uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3">From Browse to Doorstep in 4 Steps</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map(({ step, title, description }, index) => (
            <motion.div
              key={step}
              className="relative flex flex-col"
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={fadeUp} custom={index * 0.15}
            >
              {index < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-amber-300 z-0" />
              )}
              <div className="relative z-10 flex flex-col">
                <motion.div
                  className="w-16 h-16 bg-amber-800 text-white rounded-2xl flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-amber-200 mx-auto lg:mx-0"
                  initial={{ scale: 0, rotate: -10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={viewport}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.15 }}
                >
                  {step}
                </motion.div>
                <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeUp} custom={0}
          >
            <span className="text-amber-800 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-3">What Our Customers Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, rating, text }, i) => {
              const borders = [
                'bg-[radial-gradient(#92400e_40%,transparent_60%)]',
                'bg-[radial-gradient(#b45309_40%,transparent_60%)]',
                'bg-[radial-gradient(#d97706_40%,transparent_60%)]',
              ]
              const durations = [10000, 8500, 11500]
              return (
                <motion.div
                  key={name}
                  initial="hidden" whileInView="visible" viewport={viewport}
                  variants={fadeUp} custom={i * 0.15}
                >
                  <MovingBorderButton
                    as="div" duration={durations[i]} borderRadius="1rem"
                    borderClassName={borders[i]} containerClassName="h-auto w-full"
                    className="flex flex-col items-start bg-amber-50 border-amber-200 text-stone-800 p-8"
                  >
                    <div className="flex gap-1 mb-5">
                      {[...Array(rating)].map((_, j) => (
                        <Star key={j} size={18} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-6 italic text-left">&ldquo;{text}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{name}</p>
                        <p className="text-stone-400 text-xs">{role}</p>
                      </div>
                    </div>
                  </MovingBorderButton>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative">
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(41, 16, 2)" gradientBackgroundEnd="rgb(25, 11, 3)"
          firstColor="80, 35, 8" secondColor="100, 55, 6" thirdColor="90, 42, 5"
          fourthColor="65, 28, 7" fifthColor="95, 65, 12" pointerColor="85, 40, 7"
          blendingValue="soft-light" containerClassName="h-[26rem] w-full" interactive={true}
        >
          <div className="absolute z-50 inset-0 flex flex-col items-center justify-center px-6 md:px-10 text-center pointer-events-none">
            <motion.h2
              className="text-xl md:text-3xl font-extrabold text-amber-50 mb-4 leading-tight drop-shadow-lg"
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={fadeUp} custom={0}
            >
              Ready to Start Shopping?
            </motion.h2>
            <motion.p
              className="text-amber-200 text-sm md:text-base mb-8 max-w-md leading-relaxed drop-shadow"
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={fadeUp} custom={0.15}
            >
              Join thousands of happy customers. Create your free account today and get access to exclusive deals,
              order tracking, and a wishlist that saves your favourites.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-stretch sm:items-center w-full max-w-sm sm:max-w-none mx-auto pointer-events-auto"
              initial="hidden" whileInView="visible" viewport={viewport}
              variants={fadeUp} custom={0.3}
            >
              <CtaButton href="/auth/sign-up" variant="primary">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs">
                  Create Free Account <ArrowRight size={13} />
                </span>
              </CtaButton>
              <CtaButton href="/" variant="outline">Browse Products</CtaButton>
            </motion.div>
          </div>
        </BackgroundGradientAnimation>
      </section>

    </main>
  )
}
