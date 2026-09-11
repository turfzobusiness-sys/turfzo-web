import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { safeJsonLd } from "@/lib/schema";

// We define our schema component locally for the blog Article
type ArticleSchemaArticle = { title: string; image: string };

function ArticleSchema({ article }: { article: ArticleSchemaArticle }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": [`https://turfzo.app${article.image}`],
    "datePublished": "2026-05-01T08:00:00+08:00",
    "dateModified": "2026-05-01T08:00:00+08:00",
    "author": [{
        "@type": "Organization",
        "name": "Turfzo",
        "url": "https://turfzo.app"
      }]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}

const blogPosts: Record<string, { title: string; category: string; readTime: string; date: string; image: string; content: React.ReactNode; excerpt: string }> = {
  "book-football-turf-instantly": {
    title: "Tired of Calling? How to Book the Best Turfs Instantly",
    excerpt: "Wasting time calling multiple turfs, dealing with double bookings, and navigating lack of pricing transparency? Learn how to find and secure the best sports venues in your city instantly. Turfzo guarantees a seamless, confirmed booking every time.",
    category: "For Players",
    readTime: "5 min read",
    date: "June 2026",
    image: "/players_playing_football_1781975762157.webp",
    content: (
      <>
        <p className="mb-6">Are you tired of calling multiple turfs in your city only to find out they are fully booked? Or worse, arriving at the ground to discover your slot was double-booked? In today&apos;s fast-paced world, organizing a simple game of football or cricket with friends shouldn&apos;t feel like a part-time job.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Broken Traditional System</h2>
        <p className="mb-4">The traditional method of booking sports venues is inherently flawed. It relies on endless WhatsApp messages, unreturned phone calls, and manual ledger books managed by turf staff. This leads to:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Zero Pricing Transparency:</strong> Prices often fluctuate based on demand or your negotiation skills.</li>
          <li><strong>Double Bookings:</strong> Manual entry inevitably leads to overlapping slots, ruining the experience.</li>
          <li><strong>Wasted Time:</strong> Calling 5-6 different venues just to find one open slot is frustrating and inefficient.</li>
        </ul>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Turfzo Ideology: Players First</h2>
        <p className="mb-4">At Turfzo, we believe that sports should be accessible and frictionless. Our ideology is simple: <strong>Players deserve a premium, digital-first experience from discovery to kickoff.</strong> We have built our platform specifically to eliminate the friction of organizing local sports.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">1. Real-Time Availability & Instant Confirmation</h3>
        <p className="mb-4">No more waiting for a callback. Our platform syncs directly with the venue&apos;s inventory. What you see is exactly what is available. When you book a slot on Turfzo, it is instantly locked in our secure database, guaranteeing your playtime.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">2. Verified Venues & Authentic Reviews</h3>
        <p className="mb-4">We personally verify every turf listed on our platform. From the quality of the artificial grass to the brightness of the floodlights, we ensure the facilities meet our high standards. Plus, our community review system means you can read authentic feedback from other players before you spend a dime.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">3. Transparent, Upfront Pricing</h3>
        <p className="mb-4">The price you see is the price you pay. No hidden fees or sudden surges. We negotiate standard rates with turf owners to ensure you get the best value for your money.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">How to Secure Your Pitch in 60 Seconds</h2>
        <p className="mb-4">Booking your next game has never been easier:</p>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li><strong>Search:</strong> Visit the Turfzo Explore page and enter your city.</li>
          <li><strong>Filter:</strong> Select your preferred sport (Football, Cricket, Badminton, etc.) and filter by amenities like Floodlights or Free Parking.</li>
          <li><strong>Book:</strong> Choose an available time slot and pay securely via UPI, Card, or Netbanking.</li>
          <li><strong>Play:</strong> Receive an instant digital ticket with a QR code to present at the venue.</li>
        </ol>
        <p className="mb-4 font-semibold italic">Stop wasting time negotiating and start playing. Explore turfs near you today on Turfzo.</p>
      </>
    )
  },
  "organize-local-sports-tournaments": {
    title: "How to Organize the Perfect Local Sports Tournament",
    excerpt: "Struggling to find teammates or coordinate matches? Discover the best ways to bring your community together through sports, organize 5v5 tournaments, and foster local growth. Turfzo empowers community leaders with the right tools.",
    category: "For Community",
    readTime: "7 min read",
    date: "June 2026",
    image: "/community_sports_tournament_1781975774951.webp",
    content: (
      <>
        <p className="mb-6">Sports have always been the ultimate community builder. Whether it&apos;s a neighborhood 5v5 football cup, a corporate weekend cricket league, or a charity badminton tournament, nothing brings people together like friendly competition. However, organizing these events can feel like a logistical nightmare.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Logistical Nightmare of Local Tournaments</h2>
        <p className="mb-4">Community leaders and tournament organizers often face significant hurdles:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Securing a Reliable Venue:</strong> Finding a venue that can accommodate a full-day event with multiple pitches is incredibly difficult.</li>
          <li><strong>Managing Finances:</strong> Collecting entry fees from dozens of teams via fragmented UPI transfers leads to accounting chaos.</li>
          <li><strong>Communication Breakdown:</strong> Keeping all teams updated on fixtures, rules, and delays via WhatsApp groups is inefficient.</li>
        </ul>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">Our Vision: Empowering Community Leaders</h2>
        <p className="mb-4">At Turfzo, we believe that <strong>local sports are the heartbeat of a healthy community</strong>. Our goal is to empower organizers by providing the digital infrastructure needed to host successful, professional-grade tournaments at the amateur level.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">Step 1: Finding the Right Venue on Turfzo</h3>
        <p className="mb-4">The most critical part of any tournament is the venue. You need a place with consistent playability, good lighting, and proper amenities like washrooms, first-aid, and spectator seating. Artificial turfs are the most reliable option, as they are rarely affected by bad weather.</p>
        <p className="mb-4">Using Turfzo, you can filter venues that specifically cater to large events. You can easily view the exact dimensions of the pitch, the available facilities, and book consecutive slots across multiple pitches simultaneously.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">Step 2: Leveraging Turfzo&apos;s Tournament Tools (Coming Soon)</h3>
        <p className="mb-4">We are actively building features specifically designed for organizers:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Bulk Booking Discounts:</strong> Seamlessly book multi-hour slots across multiple pitches at automatically applied discounted rates.</li>
          <li><strong>Team Registration Portals:</strong> Create a custom tournament page on Turfzo where teams can register and pay their entry fees securely.</li>
          <li><strong>Digital Fixtures:</strong> Automatically generate and share digital brackets and match schedules.</li>
        </ul>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">Tips for a Successful Event</h2>
        <p className="mb-4">While we handle the digital side, here are a few physical elements to ensure your tournament is a hit:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Hire Certified Referees:</strong> Don&apos;t rely on players to ref. Professional referees ensure fair play and reduce arguments.</li>
          <li><strong>Arrange Hydration and First Aid:</strong> Ensure you have plenty of water, electrolytes, and a basic medical kit on hand. (Pro-tip: Filter turfs on Turfzo that provide these amenities by default!)</li>
          <li><strong>Document the Event:</strong> Hire a local photographer or assign someone to take high-quality photos. It adds immense value to the players&apos; experience.</li>
        </ul>
        <p className="mb-4 font-semibold italic">Ready to host your next big event? Browse our premium multi-pitch venues today.</p>
      </>
    )
  },
  "maximize-turf-roi-booking-management": {
    title: "Maximizing Your Turf's ROI: The Ultimate Management Guide",
    excerpt: "Are empty slots, complex booking management, and high marketing costs hurting your business? Learn how to increase bookings during off-peak hours. Turfzo partners with owners to streamline operations and maximize revenue.",
    category: "For Owners",
    readTime: "6 min read",
    date: "June 2026",
    image: "/turf_owner_dashboard_1781975786523.webp",
    content: (
      <>
        <p className="mb-6">Running a sports facility is a capital-intensive business. Between the high cost of real estate, the installation of FIFA-certified artificial grass, and ongoing maintenance (like brushing and infill top-ups), owners need a robust strategy to ensure profitability. Maximizing the utilization rate of your pitches is the only way to achieve a strong Return on Investment (ROI).</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The High Cost of Empty Slots</h2>
        <p className="mb-4">Every unbooked hour is lost revenue. While peak hours (evenings from 6 PM to 10 PM and weekends) might naturally sell out due to high demand, the &quot;dead zones&quot; (early mornings, mid-afternoons) often remain empty. The traditional approach of relying entirely on walk-ins or word-of-mouth is no longer sufficient in a competitive market.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Turfzo Partnership Model</h2>
        <p className="mb-4">We view turf owners as our primary partners. Turfzo isn&apos;t just another booking aggregator; it is a <strong>comprehensive management suite designed to streamline operations and aggressively drive revenue</strong>. Our platform solves the biggest headaches of facility management.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">1. Dynamic Pricing Strategies</h3>
        <p className="mb-4">To combat empty off-peak slots, Turfzo allows you to implement dynamic pricing. You can automatically lower prices during dead zones to attract students or flexible workers, while maintaining premium pricing during high-demand evening slots. Our data shows that dynamic pricing can increase overall utilization by up to 35%.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">2. The Owner Dashboard Analytics</h3>
        <p className="mb-4">Data is the new oil. The Turfzo Owner Dashboard provides real-time analytics on your booking trends. You can track:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Peak Utilization Metrics:</strong> Exactly which hours are your most profitable.</li>
          <li><strong>Customer Retention:</strong> Identify your most loyal teams and offer them tailored subscription packages.</li>
          <li><strong>Revenue Forecasting:</strong> Predict upcoming monthly revenue based on advance bookings.</li>
        </ul>
        <h3 className="text-xl font-bold mt-8 mb-4">3. Automated Financial Settlements</h3>
        <p className="mb-4">Say goodbye to chasing down late payments or manually reconciling UPI transactions at the end of the night. Turfzo handles all payment processing securely via Cashfree, ensuring that funds are automatically settled into your business account with complete transparency and zero accounting errors.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">Marketing, Amplified</h2>
        <p className="mb-4">When you list your venue on Turfzo, you instantly tap into our massive user base of active sports enthusiasts. You no longer need to spend heavily on local Facebook or Instagram ads. We drive high-intent, converting traffic directly to your digital storefront on our app.</p>
        <p className="mb-4 font-semibold italic">Join the hundreds of turf owners who are maximizing their ROI with Turfzo. Register your facility today.</p>
      </>
    )
  },
  "future-of-amateur-sports-india": {
    title: "The Future of Amateur Sports Infrastructure in India",
    excerpt: "As grassroots sports rapidly expand across India, the demand for high-quality, accessible playing facilities has never been higher. Explore how Turfzo is democratizing access to premium sports infrastructure in top metro cities.",
    category: "Industry",
    readTime: "8 min read",
    date: "June 2026",
    image: "/future_of_amateur_sports_1781976167558.webp",
    content: (
      <>
        <p className="mb-6">For decades, amateur sports in India were confined to dusty, unmaintained public parks or expensive private club memberships. However, a massive cultural shift is currently underway. A growing middle class, increased focus on physical fitness, and the rise of local franchise leagues (like the ISL and PKL) have sparked an unprecedented demand for high-quality, accessible sports infrastructure.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Rise of the Pay-and-Play Model</h2>
        <p className="mb-4">The solution to India&apos;s space constraint in sprawling metro cities like Mumbai, Bangalore, and Delhi has been the aggressive expansion of the &quot;pay-and-play&quot; turf model. Independent entrepreneurs are transforming unused rooftops, warehouse spaces, and vacant lots into state-of-the-art 5v5 football pitches and box cricket arenas.</p>
        <p className="mb-4">This decentralized model is brilliant because it brings premium facilities directly into residential neighborhoods. Players no longer need to commute an hour to reach a decent ground.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Turfzo Ideology: Democratizing Access</h2>
        <p className="mb-4">While the physical infrastructure is growing, the digital infrastructure to support it has lagged behind. This is where Turfzo enters the picture. <strong>Our ideology is rooted in the democratization of sports access.</strong> We believe that finding and booking a world-class pitch should be as easy as ordering food or hailing a cab.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">Bridging the Gap</h3>
        <p className="mb-4">By bringing hundreds of independent sports facilities onto a single, unified digital platform, Turfzo is actively organizing a highly fragmented industry. We provide a centralized hub where players can instantly discover the best infrastructure their city has to offer, compare amenities, and secure a booking.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">Supporting Grassroots Growth</h3>
        <p className="mb-4">By ensuring that these independent turf owners have the software tools to maximize their revenue and survive, we are indirectly ensuring the continued growth of grassroots sports infrastructure in India. When turf owners succeed, they build more facilities. When more facilities are built, more people play.</p>
        <p className="mb-4 font-semibold italic">Turfzo is proud to be the digital backbone of India&apos;s amateur sports revolution.</p>
      </>
    )
  },
  "turf-vs-ground-injury-prevention": {
    title: "Turf Quality & Injury Prevention: What Players Need to Know",
    excerpt: "Not all artificial turfs are created equal. Understand the difference between FIFA-certified 3G/4G pitches and subpar surfaces, and learn why Turfzo stringently verifies every venue for player safety and optimal performance.",
    category: "Educational",
    readTime: "6 min read",
    date: "June 2026",
    image: "/turf_quality_closeup_1781976182142.webp",
    content: (
      <>
        <p className="mb-6">The debate between playing on natural grass versus artificial turf has existed since the invention of Astroturf. While natural grass is the gold standard for professional leagues, it is incredibly difficult and expensive to maintain in a high-traffic, amateur setting. Artificial turf solves the durability problem, allowing 10+ hours of play per day regardless of the weather. But what about player safety?</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">The Evolution of Artificial Turf</h2>
        <p className="mb-4">First-generation turfs (essentially thin green carpets over concrete) were notorious for causing severe abrasions (&quot;turf burn&quot;) and joint injuries due to the lack of shock absorption. However, modern turfs have evolved drastically.</p>
        <h3 className="text-xl font-bold mt-8 mb-4">Understanding 3G and 4G Pitches</h3>
        <p className="mb-4">Today&apos;s premium venues use Third Generation (3G) or Fourth Generation (4G) surfaces. These feature:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Longer Synthetic Grass Blades:</strong> Usually 40mm to 60mm in length, mimicking the feel of real grass.</li>
          <li><strong>Shock Pads:</strong> A layer of padding underneath the carpet to absorb impact, drastically reducing stress on the knees and ankles.</li>
          <li><strong>Infill (Rubber Pellets and Sand):</strong> This is the crucial component. The infill provides traction, allows the boot studs to penetrate safely, and acts as a cushion.</li>
        </ul>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">Why Venue Verification Matters</h2>
        <p className="mb-4">The reality is that not all turfs are created equal. Some owners cut costs by skipping the shock pad or neglecting to top-up the rubber infill. Playing on a degraded turf significantly increases the risk of ACL tears and impact injuries.</p>
        <p className="mb-4"><strong>This is where Turfzo&apos;s verification process steps in.</strong> Our ideology dictates that player safety is non-negotiable. Before a venue is listed as &quot;Premium&quot; or &quot;Verified&quot; on our platform, we assess the quality of the surface. We look for adequate infill levels, proper shock absorption, and overall maintenance standards.</p>
        <h2 className="text-2xl font-extrabold text-text-main mt-10 mb-4">Tips for Injury Prevention on Turf</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Wear the Right Boots:</strong> Do not use firm ground (FG) metal studs or long plastic studs on artificial turf; they grip the surface too tightly and can cause knee torque injuries. Always use Artificial Grass (AG) boots or turf shoes (TF) with small rubber dimples.</li>
          <li><strong>Warm Up Properly:</strong> Artificial surfaces generate more friction. A thorough dynamic warm-up is essential to prepare your joints.</li>
          <li><strong>Book Verified Venues:</strong> Stick to venues that maintain their pitches. Use Turfzo&apos;s filters to find highly-rated, premium venues that prioritize player safety.</li>
        </ul>
        <p className="mb-4 font-semibold italic">Play hard, but play safe. Book your next game on a verified, high-quality pitch through Turfzo.</p>
      </>
    )
  }
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Turfzo Blog`,
    description: post.excerpt,
    alternates: { canonical: `https://turfzo.app/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <link rel="canonical" href={`https://turfzo.app/blog/${slug}`} />
      </head>
      <ArticleSchema article={post} />
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 md:px-8 w-full">
          <nav className="flex items-center gap-1.5 text-xs text-text-muted font-sans mb-8">
            <Link href="/" className="hover:text-text-main transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-text-main transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-lime truncate max-w-[200px]">{post.title}</span>
          </nav>

          <header className="mb-10">
            <span className="inline-block bg-brand-lime text-black font-sans font-bold text-[10px] px-2.5 py-1 rounded-md mb-4">
              {post.category}
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-text-muted font-sans border-b border-border-default pb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-lime" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-lime" /> {post.readTime}
              </span>
            </div>
          </header>

          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-10 bg-elevated border border-border-default">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
          </div>

          <div className="prose dark:prose-invert prose-brand max-w-none font-sans text-sm sm:text-base leading-relaxed text-text-muted">
            {post.content}
          </div>

          <div className="mt-16 pt-8 border-t border-border-default text-center">
            <h3 className="font-sans font-bold text-xl text-text-main mb-4">Ready to play?</h3>
            <Link href="/explore" className="inline-flex items-center justify-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm py-3 px-8 rounded-md transition-all">
              Book a Turf Now <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
