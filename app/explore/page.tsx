"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search as SearchIcon, 
  MapPin, 
  ChevronDown, 
  Star, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Award,
  Grid,
  List,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Heart,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  Download,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Interface for turf venues
interface Turf {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  sport: "Football" | "Cricket" | "Multipurpose";
  size: string;
  premium: boolean;
  facilities: string[];
  image: string;
}

const INITIAL_TURFS: Turf[] = [
  {
    id: "turf-1",
    name: "Playo Turf, HSR Layout",
    location: "HSR Layout, Bengaluru, Karnataka",
    rating: 4.8,
    reviews: 230,
    price: 1000,
    sport: "Football",
    size: "7v7",
    premium: true,
    facilities: ["Flood Lights", "Parking", "Changing Room"],
    image: "/stadium_turf_bg.png"
  },
  {
    id: "turf-2",
    name: "Kickoff Arena, Koramangala",
    location: "Koramangala, Bengaluru, Karnataka",
    rating: 4.6,
    reviews: 180,
    price: 900,
    sport: "Football",
    size: "7v7",
    premium: false,
    facilities: ["Flood Lights", "Parking"],
    image: "/stadium_turf_bg.png"
  },
  {
    id: "turf-3",
    name: "ScoreField Turf, Marathahalli",
    location: "Marathahalli, Bengaluru, Karnataka",
    rating: 4.5,
    reviews: 150,
    price: 800,
    sport: "Football",
    size: "7v7",
    premium: false,
    facilities: ["Flood Lights", "Parking", "Cafeteria"],
    image: "/stadium_turf_bg.png"
  },
  {
    id: "turf-4",
    name: "Indiranagar Cricket Club",
    location: "Indiranagar, Bengaluru, Karnataka",
    rating: 4.7,
    reviews: 95,
    price: 1200,
    sport: "Cricket",
    size: "8v8 Nets",
    premium: true,
    facilities: ["Flood Lights", "Parking", "Cafeteria", "Changing Room"],
    image: "/stadium_turf_bg.png"
  },
  {
    id: "turf-5",
    name: "Golden Sports Arena",
    location: "Whitefield, Bengaluru, Karnataka",
    rating: 4.4,
    reviews: 82,
    price: 1500,
    sport: "Multipurpose",
    size: "9v9",
    premium: false,
    facilities: ["Flood Lights", "Parking", "Changing Room"],
    image: "/stadium_turf_bg.png"
  }
];

export default function ExplorePage() {
  // Booking Flow Steps State: 'listing' | 'slots' | 'checkout' | 'processing' | 'confirmed'
  const [flowStep, setFlowStep] = useState<'listing' | 'slots' | 'checkout' | 'processing' | 'confirmed'>('listing');
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Search state
  const [searchLocation, setSearchLocation] = useState("Bengaluru, Karnataka");
  const [searchDate, setSearchDate] = useState("24 May, Fri");
  const [searchTime, setSearchTime] = useState("06:00 PM");

  // Filtering States
  const [selectedSports, setSelectedSports] = useState<string[]>(["Football"]);
  const [priceRange, setPriceRange] = useState(3000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(["Flood Lights", "Parking"]);
  const [sortBy, setSortBy] = useState("Popular");
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState("24 May, Fri");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPitch, setSelectedPitch] = useState("Pitch 2 (Premium Grass)");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [bookingId, setBookingId] = useState("");

  // Filtered turfs
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>(INITIAL_TURFS);

  // Apply filters whenever states change
  useEffect(() => {
    let result = INITIAL_TURFS;

    // Filter by sports selection
    if (selectedSports.length > 0) {
      result = result.filter(t => selectedSports.includes(t.sport));
    }

    // Filter by max price
    result = result.filter(t => t.price <= priceRange);

    // Filter by facilities (must contain all selected facilities)
    if (selectedFacilities.length > 0) {
      result = result.filter(t => 
        selectedFacilities.every(f => t.facilities.includes(f))
      );
    }

    // Sort by selection
    if (sortBy === "Popular") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    setFilteredTurfs(result);
  }, [selectedSports, priceRange, selectedFacilities, sortBy]);

  // Wishlist toggle helper
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedSports(["Football"]);
    setPriceRange(3000);
    setSelectedFacilities(["Flood Lights", "Parking"]);
    setSortBy("Popular");
  };

  // Select slots helper
  const handleOpenSlots = (turf: Turf) => {
    setSelectedTurf(turf);
    setSelectedTimeSlot(null);
    setFlowStep('slots');
  };

  // Proceed from slots to checkout
  const handleProceedToCheckout = () => {
    if (!selectedTimeSlot) return;
    setFlowStep('checkout');
  };

  // Simulate payment processing
  const handlePayNow = () => {
    setFlowStep('processing');
    // Generate simulated Booking ID
    const randomId = "TFZ-" + Math.floor(100000 + Math.random() * 900000);
    setBookingId(randomId);

    setTimeout(() => {
      setFlowStep('confirmed');
    }, 2500);
  };

  // Pricing calculations
  const getPricingDetails = () => {
    if (!selectedTurf) return { subtotal: 0, convenience: 0, gst: 0, total: 0 };
    const subtotal = selectedTurf.price;
    const convenience = Math.round(subtotal * 0.018); // 1.8%
    const gst = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + convenience + gst;
    return { subtotal, convenience, gst, total };
  };

  const pricing = getPricingDetails();

  // Mock slot times
  const timeSlots = {
    morning: ["06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM"],
    evening: ["04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM", "06:00 PM - 07:00 PM (Booked)", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM"],
    night: ["09:00 PM - 10:00 PM", "10:00 PM - 11:00 PM"]
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        
        {/* Step 1: Explore Listings */}
        {flowStep === 'listing' && (
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
            
            {/* Header Section with Stadium background in CSS */}
            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-card-shadow p-8 sm:p-12 mb-10 min-h-[220px] flex flex-col justify-end">
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 opacity-40" 
                style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/70 to-transparent z-0" />
              
              <div className="relative z-10 text-left mb-6">
                <span className="text-xs font-poppins font-extrabold tracking-widest text-brand-lime uppercase">
                  EXPLORE TURFS
                </span>
                <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-2 leading-none">
                  Find & Book <br />
                  The <span className="text-brand-lime">Best Turfs</span>
                </h1>
                <p className="mt-2 text-text-muted text-sm font-sans">
                  Top quality turfs near you. Anytime, Anywhere.
                </p>
              </div>

              {/* Floating search widget in a glass card */}
              <div className="relative z-10 w-full bg-surface-dark/90 backdrop-blur-md border border-white/10 rounded-pill p-2 pl-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-card-shadow mt-4">
                
                {/* Location */}
                <div className="flex items-center gap-3 border-r border-white/5 pr-4 py-2">
                  <MapPin className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Location</span>
                    <input 
                      type="text" 
                      value={searchLocation} 
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="bg-transparent text-xs text-text-main font-semibold mt-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 border-r border-white/5 pr-4 py-2">
                  <CalendarIcon className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Date</span>
                    <input 
                      type="text" 
                      value={searchDate} 
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="bg-transparent text-xs text-text-main font-semibold mt-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 border-r border-white/5 pr-4 py-2">
                  <Clock className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Time</span>
                    <input 
                      type="text" 
                      value={searchTime} 
                      onChange={(e) => setSearchTime(e.target.value)}
                      className="bg-transparent text-xs text-text-main font-semibold mt-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* Search CTA */}
                <button className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3.5 px-6 rounded-pill transition-all duration-300 w-full">
                  Search
                </button>
              </div>
            </div>

            {/* Content Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Filters Sidebar */}
              <div className="lg:col-span-3 bg-surface-dark border border-white/5 rounded-md p-6 flex flex-col gap-6 sticky top-24">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-lime" />
                    <span className="font-poppins font-bold text-base text-text-main">Filters</span>
                  </div>
                  <button 
                    onClick={handleResetFilters}
                    className="text-xs font-sans text-text-muted hover:text-brand-lime transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                {/* Sport Filter */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Sport</span>
                  <div className="flex flex-col gap-2">
                    {["Football", "Cricket", "Multipurpose"].map((sport) => {
                      const isChecked = selectedSports.includes(sport);
                      return (
                        <label key={sport} className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-main cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedSports(selectedSports.filter(s => s !== sport));
                              } else {
                                setSelectedSports([...selectedSports, sport]);
                              }
                            }}
                            className="w-4 h-4 rounded accent-brand-lime"
                          />
                          <span>{sport}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="flex flex-col gap-3 border-t border-white/5 pt-5">
                  <div className="flex justify-between items-center text-xs font-poppins font-bold uppercase text-text-main tracking-wider">
                    <span>Max Price</span>
                    <span className="text-brand-lime font-sans font-bold text-sm">₹{priceRange}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="3000" 
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-elevated-dark rounded-lg appearance-none cursor-pointer accent-brand-lime"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-sans">
                    <span>₹500</span>
                    <span>₹3000+</span>
                  </div>
                </div>

                {/* Facilities Filter */}
                <div className="flex flex-col gap-3 border-t border-white/5 pt-5">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Facilities</span>
                  <div className="flex flex-col gap-2">
                    {["Flood Lights", "Parking", "Changing Room", "Cafeteria"].map((facility) => {
                      const isChecked = selectedFacilities.includes(facility);
                      return (
                        <label key={facility} className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-main cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
                              } else {
                                setSelectedFacilities([...selectedFacilities, facility]);
                              }
                            }}
                            className="w-4 h-4 rounded accent-brand-lime"
                          />
                          <span>{facility}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Turf Listings */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                
                {/* Result header & Sort */}
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-bold text-sm text-text-muted">
                    <span className="text-brand-lime">{filteredTurfs.length}</span> Turfs found
                  </span>
                  <div className="flex items-center gap-4">
                    
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
                      <span>Sort by:</span>
                      <div className="relative">
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-surface-dark border border-white/5 text-text-main py-1.5 pl-3 pr-8 rounded-md font-semibold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option>Popular</option>
                          <option>Price: Low to High</option>
                          <option>Price: High to Low</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Layout View Toggles */}
                    <div className="flex items-center bg-surface-dark border border-white/5 rounded-md p-1 gap-1">
                      <button className="p-1 bg-elevated-dark text-brand-lime rounded"><List className="w-4 h-4" /></button>
                      <button className="p-1 text-text-muted hover:text-brand-lime rounded"><Grid className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-5">
                  {filteredTurfs.length === 0 ? (
                    <div className="bg-surface-dark border border-white/5 rounded-md p-16 text-center flex flex-col items-center justify-center gap-4">
                      <SlidersHorizontal className="w-12 h-12 text-text-muted opacity-50" />
                      <h3 className="font-poppins font-bold text-lg text-text-main">No Venues Found</h3>
                      <p className="text-text-muted text-sm font-sans max-w-xs">Try adjusting your filters or resetting the form to discover matches.</p>
                      <button onClick={handleResetFilters} className="bg-brand-lime text-black font-semibold px-6 py-2 rounded-pill mt-2">Reset Filters</button>
                    </div>
                  ) : (
                    filteredTurfs.map((turf) => (
                      <motion.div 
                        key={turf.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-surface-dark border border-white/5 hover:border-brand-lime/10 rounded-md p-5 flex flex-col md:flex-row gap-6 transition-all duration-300 hover:shadow-card-shadow"
                      >
                        
                        {/* Left: Picture */}
                        <div className="relative w-full md:w-60 h-40 bg-elevated-dark rounded-sm overflow-hidden flex-shrink-0">
                          <Image 
                            src={turf.image} 
                            alt={turf.name}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                          
                          {/* Premium badge */}
                          {turf.premium && (
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-brand-lime/30 text-brand-lime font-poppins font-bold text-[10px] px-2.5 py-1 rounded-pill flex items-center gap-1 select-none">
                              <Award className="w-3.5 h-3.5 fill-brand-lime text-brand-lime" />
                              Premium
                            </div>
                          )}

                          {/* Wishlist Heart */}
                          <button 
                            onClick={() => toggleWishlist(turf.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-text-main hover:text-brand-lime transition-colors"
                          >
                            <Heart className={`w-4.5 h-4.5 ${wishlist.includes(turf.id) ? "fill-brand-lime text-brand-lime" : ""}`} />
                          </button>
                        </div>

                        {/* Right: Info */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            
                            {/* Title & Verified */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-poppins font-bold text-lg text-text-main hover:text-brand-lime transition-colors">
                                {turf.name}
                              </h3>
                              <span className="w-4 h-4 bg-brand-lime text-black rounded-full flex items-center justify-center text-[10px] font-bold select-none" title="Verified Venue">✓</span>
                            </div>

                            {/* Location */}
                            <p className="text-xs text-text-muted font-sans flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              {turf.location}
                            </p>

                            {/* Amenities Tag Line */}
                            <div className="flex items-center gap-5 mt-4 text-xs text-text-muted border-t border-white/5 pt-4 flex-wrap">
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Sport</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.sport} ({turf.size})</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Flood Lights</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.facilities.includes("Flood Lights") ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Parking</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.facilities.includes("Parking") ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Rating</span>
                                <span className="font-semibold text-brand-lime mt-0.5 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-brand-lime text-brand-lime" />
                                  {turf.rating} <span className="text-[10px] text-text-muted font-normal">({turf.reviews} Reviews)</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & View CTA */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 md:mt-0">
                            <div>
                              <span className="text-[10px] text-text-muted block leading-none font-sans uppercase">Starting from</span>
                              <span className="text-xl font-poppins font-extrabold text-brand-lime mt-1 block">
                                ₹{turf.price} <span className="text-xs text-text-muted font-normal font-sans">/hr</span>
                              </span>
                            </div>
                            <button 
                              onClick={() => handleOpenSlots(turf)}
                              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3 px-6 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1"
                            >
                              View Slots
                              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>

                        </div>

                      </motion.div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Step 2: Slot Selection Modal */}
        <AnimatePresence>
          {flowStep === 'slots' && selectedTurf && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-surface-dark border border-white/10 rounded-md max-w-xl w-full p-6 relative shadow-card-shadow max-h-[90vh] overflow-y-auto"
              >
                
                {/* Close Button */}
                <button 
                  onClick={() => setFlowStep('listing')}
                  className="absolute top-4 right-4 p-1.5 bg-elevated-dark hover:bg-white/10 rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header details */}
                <div className="text-left">
                  <span className="text-[10px] font-sans font-bold uppercase text-brand-lime bg-brand-lime/10 px-2.5 py-1 rounded-pill w-fit inline-block">
                    SELECT SLOT
                  </span>
                  <h2 className="font-poppins font-bold text-xl text-text-main mt-2">
                    {selectedTurf.name}
                  </h2>
                  <p className="text-xs text-text-muted flex items-center gap-0.5 mt-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" /> {selectedTurf.location}
                  </p>
                </div>

                {/* Date Selection strip */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider text-left">Select Date</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                    {[
                      { day: "24 May, Fri", label: "24 May", desc: "Fri" },
                      { day: "25 May, Sat", label: "25 May", desc: "Sat" },
                      { day: "26 May, Sun", label: "26 May", desc: "Sun" },
                      { day: "27 May, Mon", label: "27 May", desc: "Mon" },
                      { day: "28 May, Tue", label: "28 May", desc: "Tue" }
                    ].map((d) => (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDate(d.day)}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border min-w-16 transition-all ${
                          selectedDate === d.day 
                            ? "bg-brand-lime text-black border-brand-lime font-bold shadow-glow-lime" 
                            : "bg-elevated-dark text-text-muted border-white/5 hover:text-text-main"
                        }`}
                      >
                        <span className="text-xs">{d.desc}</span>
                        <span className="text-sm font-poppins font-extrabold mt-1">{d.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pitch Selection details */}
                <div className="mt-6 flex flex-col gap-2.5 text-left">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Select Pitch</span>
                  <div className="grid grid-cols-2 gap-3">
                    {["Pitch 1 (Premium Turf)", "Pitch 2 (Premium Grass)"].map((pitch) => (
                      <button
                        key={pitch}
                        onClick={() => setSelectedPitch(pitch)}
                        className={`p-3 text-xs rounded-md border text-center font-sans font-semibold transition-all ${
                          selectedPitch === pitch 
                            ? "bg-elevated-dark text-brand-lime border-brand-lime/50" 
                            : "bg-elevated-dark text-text-muted border-white/5 hover:text-text-main"
                        }`}
                      >
                        {pitch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots selector */}
                <div className="mt-6 flex flex-col gap-4 text-left">
                  
                  {/* Evening Slots */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-lime" /> Evening & Night Slots
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.evening.map((slot) => {
                        const isBooked = slot.includes("(Booked)");
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2.5 rounded-md border text-xs font-semibold text-center transition-all ${
                              isBooked 
                                ? "bg-bg-dark/40 text-text-muted/30 border-white/5 line-through cursor-not-allowed" 
                                : isSelected 
                                  ? "bg-brand-lime text-black border-brand-lime shadow-glow-lime font-bold" 
                                  : "bg-elevated-dark text-text-muted border-white/5 hover:text-text-main"
                            }`}
                          >
                            {slot.replace(" (Booked)", "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Summary & Checkout Proceed */}
                <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-text-muted uppercase">Selected Slot</span>
                    <span className="text-xs font-bold text-text-main block mt-1">
                      {selectedTimeSlot ? `${selectedDate} | ${selectedTimeSlot}` : "No slot selected"}
                    </span>
                  </div>
                  <button
                    disabled={!selectedTimeSlot}
                    onClick={handleProceedToCheckout}
                    className="bg-brand-lime disabled:bg-elevated-dark disabled:text-text-muted/40 text-black font-poppins font-bold text-sm py-3 px-8 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1.5"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Checkout Modal */}
        <AnimatePresence>
          {flowStep === 'checkout' && selectedTurf && selectedTimeSlot && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-surface-dark border border-white/10 rounded-md max-w-xl w-full p-6 relative shadow-card-shadow max-h-[90vh] overflow-y-auto"
              >
                
                {/* Back Button */}
                <button 
                  onClick={() => setFlowStep('slots')}
                  className="absolute top-4 left-4 p-1.5 bg-elevated-dark hover:bg-white/10 rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5 rotate-45" />
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setFlowStep('listing')}
                  className="absolute top-4 right-4 p-1.5 bg-elevated-dark hover:bg-white/10 rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mt-3">
                  <span className="text-[10px] font-sans font-bold uppercase text-brand-lime bg-brand-lime/10 px-2.5 py-1 rounded-pill w-fit inline-block">
                    CHECKOUT
                  </span>
                  <h2 className="font-poppins font-bold text-xl text-text-main mt-3">
                    Confirm Your Booking
                  </h2>
                </div>

                {/* Booking summary ticket card */}
                <div className="mt-6 bg-elevated-dark rounded-md p-4 border border-white/5 text-left flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-text-main">{selectedTurf.name}</h4>
                      <p className="text-[11px] text-text-muted flex items-center gap-0.5 mt-0.5 font-sans">
                        <MapPin className="w-3 h-3 text-brand-lime shrink-0" /> {selectedTurf.location.split(",")[0]}
                      </p>
                    </div>
                    <span className="text-xs bg-brand-lime/10 text-brand-lime font-sans font-bold px-2 py-0.5 rounded border border-brand-lime/10">
                      {selectedTurf.sport}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-muted uppercase">Selected Date</span>
                      <span className="font-semibold text-text-main">{selectedDate}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-muted uppercase">Time Slot</span>
                      <span className="font-semibold text-text-main">{selectedTimeSlot}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[10px] text-text-muted uppercase">Pitch Details</span>
                      <span className="font-semibold text-brand-lime">{selectedPitch}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="mt-6 flex flex-col gap-3 text-left">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Select Payment Method</span>
                  
                  <div className="flex flex-col gap-2">
                    
                    {/* UPI Gpay */}
                    <label className={`p-4 rounded-md border flex items-center justify-between cursor-pointer select-none transition-colors ${
                      selectedPayment === 'upi' ? 'bg-elevated-dark border-brand-lime/50' : 'bg-surface-dark border-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          checked={selectedPayment === 'upi'}
                          onChange={() => setSelectedPayment('upi')}
                          className="accent-brand-lime"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main">Pay via UPI (GPay, PhonePe, Paytm)</span>
                          <span className="text-[10px] text-text-muted mt-0.5">Instant booking confirmation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-sans text-text-muted">GPay</span>
                        <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-sans text-text-muted">Paytm</span>
                      </div>
                    </label>

                    {/* Credit Card */}
                    <label className={`p-4 rounded-md border flex items-center justify-between cursor-pointer select-none transition-colors ${
                      selectedPayment === 'card' ? 'bg-elevated-dark border-brand-lime/50' : 'bg-surface-dark border-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          checked={selectedPayment === 'card'}
                          onChange={() => setSelectedPayment('card')}
                          className="accent-brand-lime"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main">Credit / Debit Card</span>
                          <span className="text-[10px] text-text-muted mt-0.5">Visa, Mastercard, RuPay, Amex</span>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-text-muted shrink-0" />
                    </label>

                  </div>
                </div>

                {/* Bill details */}
                <div className="mt-6 border-t border-white/5 pt-5 flex flex-col gap-2.5 text-xs font-sans text-left">
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Base Fare (1 Hour)</span>
                    <span>₹{pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Convenience Fee (1.8%)</span>
                    <span>₹{pricing.convenience}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted pb-2 border-b border-white/5">
                    <span>GST (18% GST)</span>
                    <span>₹{pricing.gst}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-poppins font-extrabold text-text-main">
                    <span>Total Payable</span>
                    <span className="text-brand-lime">₹{pricing.total}</span>
                  </div>
                </div>

                {/* Secure checkout info & Pay Action */}
                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-[10px] text-text-muted font-sans flex items-center justify-center gap-1 select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    Payments are encrypted & secured by Turfzo Pay Gateway.
                  </p>
                  
                  <button 
                    onClick={handlePayNow}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3.5 rounded-md transition-all duration-300 hover:scale-102 flex items-center justify-center gap-1.5"
                  >
                    Pay Now · ₹{pricing.total}
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Loading Processing Overlay */}
        <AnimatePresence>
          {flowStep === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2.5]" />
              <h3 className="font-poppins font-bold text-lg text-text-main mt-2">Securely Processing Payment</h3>
              <p className="text-xs text-text-muted font-sans text-center max-w-xs">Connecting to banking servers. Please do not close or refresh this window.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 5: Payment Confirmation Receipt */}
        {flowStep === 'confirmed' && selectedTurf && selectedTimeSlot && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto px-6 md:px-8 w-full text-center flex flex-col items-center mt-12"
          >
            
            {/* Glowing checkmark animation */}
            <div className="relative w-20 h-20 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-glow-lime-intense select-none">
              <Check className="w-10 h-10 text-brand-lime stroke-[3]" />
            </div>

            <h1 className="font-poppins text-3xl font-extrabold text-text-main mt-6">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-sm text-text-muted font-sans max-w-xs">
              Your slot is successfully reserved. Present the digital ticket receipt when arriving.
            </p>

            {/* Ticket Card container (Glassmorphic Card with ticket cuts) */}
            <div className="relative w-full bg-surface-dark border border-white/10 rounded-md p-6 mt-8 shadow-card-shadow text-left flex flex-col gap-6 overflow-hidden">
              
              {/* Ticket side circles cuts in CSS */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-bg-dark rounded-full border-r border-white/10" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-bg-dark rounded-full border-l border-white/10" />

              {/* Booking ID Header */}
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-sans">Booking Receipt ID</span>
                  <span className="font-poppins font-bold text-base text-brand-lime tracking-wide">{bookingId}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-sans font-bold bg-brand-lime/10 text-brand-lime border border-brand-lime/10 rounded-pill px-3 py-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" /> paid
                </div>
              </div>

              {/* Venue details */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-sans">Venue Venue details</span>
                <h3 className="font-poppins font-extrabold text-lg text-text-main">{selectedTurf.name}</h3>
                <p className="text-xs text-text-muted flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" /> {selectedTurf.location}
                </p>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-sans">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Date</span>
                  <span className="font-semibold text-text-main">{selectedDate}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Time Slot</span>
                  <span className="font-semibold text-text-main">{selectedTimeSlot}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Pitch Info</span>
                  <span className="font-semibold text-text-main">{selectedPitch}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Amount Paid</span>
                  <span className="font-bold text-brand-lime">₹{pricing.total}</span>
                </div>
              </div>

              {/* QR Code and Gate Scanner mock */}
              <div className="border-t border-dashed border-white/10 pt-6 flex flex-col items-center justify-center gap-3">
                
                {/* Custom SVG QR Code for premium look */}
                <div className="bg-white p-3 rounded-md shadow-md select-none">
                  <svg viewBox="0 0 100 100" className="w-32 h-32 text-black">
                    {/* Corners */}
                    <rect x="0" y="0" width="30" height="30" fill="black" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="black" />

                    <rect x="70" y="0" width="30" height="30" fill="black" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="black" />

                    <rect x="0" y="70" width="30" height="30" fill="black" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="black" />

                    {/* Small inner scanner finder */}
                    <rect x="70" y="70" width="10" height="10" fill="black" />
                    <rect x="85" y="85" width="15" height="15" fill="black" />

                    {/* Dotted mesh grid simulating QR code */}
                    <rect x="40" y="5" width="10" height="20" fill="black" />
                    <rect x="55" y="10" width="5" height="5" fill="black" />
                    <rect x="35" y="45" width="15" height="10" fill="black" />
                    <rect x="15" y="40" width="10" height="5" fill="black" />
                    
                    <rect x="50" y="50" width="15" height="15" fill="black" />
                    <rect x="65" y="35" width="20" height="10" fill="black" />
                    <rect x="45" y="70" width="10" height="15" fill="black" />
                    <rect x="60" y="80" width="15" height="5" fill="black" />
                  </svg>
                </div>
                
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-text-muted select-none">
                  Scan Ticket Receipt At Entrance
                </span>
              </div>

            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => alert("Simulated ticket download success!")}
                className="bg-surface-dark hover:bg-elevated-dark border border-white/10 text-text-main font-poppins font-semibold py-3.5 px-8 rounded-pill flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" /> Download Ticket
              </button>
              
              <button
                onClick={() => setFlowStep('listing')}
                className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-semibold py-3.5 px-8 rounded-pill flex items-center justify-center gap-1.5 transition-all hover:scale-102"
              >
                Explore More Turfs
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <Link 
              href="/" 
              className="mt-6 text-xs text-text-muted hover:text-brand-lime transition-colors underline font-sans"
            >
              Go back to Home
            </Link>

          </motion.div>
        )}

      </main>

      <Footer />
    </div>
  );
}
