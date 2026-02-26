"use client";

import * as React from "react";
import { useEffect, useState } from "react";

interface Card {
  id: string;
  name: string;
  imageUrl: string;
  insuredValue: number;
  grade: {
    company: string;
    score: string | number;
  };
  rarity: string;
}

// Mock featured cards data
const FEATURED_CARDS: Card[] = [
  {
    id: "1",
    name: "Charizard VMAX",
    imageUrl: "https://placehold.co/200x280/1a1a1a/3b82f6?text=Charizard",
    insuredValue: 2500,
    grade: { company: "PSA", score: 10 },
    rarity: "epic",
  },
  {
    id: "2",
    name: "Umbreon VMAX",
    imageUrl: "https://placehold.co/200x280/1a1a1a/8b5cf6?text=Umbreon",
    insuredValue: 1800,
    grade: { company: "CGC", score: 10 },
    rarity: "epic",
  },
  {
    id: "3",
    name: "Pikachu V",
    imageUrl: "https://placehold.co/200x280/1a1a1a/facc15?text=Pikachu",
    insuredValue: 450,
    grade: { company: "PSA", score: 9 },
    rarity: "rare",
  },
  {
    id: "4",
    name: "Mewtwo GX",
    imageUrl: "https://placehold.co/200x280/1a1a1a/ef4444?text=Mewtwo",
    insuredValue: 3200,
    grade: { company: "Beckett", score: "9.5" },
    rarity: "legendary",
  },
  {
    id: "5",
    name: "Blastoise EX",
    imageUrl: "https://placehold.co/200x280/1a1a1a/22c55e?text=Blastoise",
    insuredValue: 890,
    grade: { company: "PSA", score: 10 },
    rarity: "rare",
  },
];

const RARITY_COLORS: Record<string, string> = {
  common: "#FACC15",
  uncommon: "#22C55E",
  rare: "#3B82F6",
  epic: "#EF4444",
  legendary: "#A855F7",
};

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_CARDS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff % FEATURED_CARDS.length) + FEATURED_CARDS.length) % FEATURED_CARDS.length;
    
    let translateX = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;

    if (normalizedDiff === 0) {
      translateX = 0;
      scale = 1;
      zIndex = 20;
    } else if (normalizedDiff === 1 || normalizedDiff === -4) {
      translateX = 120;
      scale = 0.85;
      opacity = 0.6;
      zIndex = 10;
    } else if (normalizedDiff === FEATURED_CARDS.length - 1 || normalizedDiff === -1) {
      translateX = -120;
      scale = 0.85;
      opacity = 0.6;
      zIndex = 10;
    } else {
      translateX = normalizedDiff < 3 ? 200 : -200;
      scale = 0.7;
      opacity = 0;
      zIndex = 0;
    }

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <div className="w-full py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Loaded in the Gacha Machine</h2>
        <p className="text-gray-400 text-sm">Premium cards waiting to be pulled</p>
      </div>

      <div 
        className="relative h-80 flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {FEATURED_CARDS.map((card, index) => (
          <div
            key={card.id}
            className="absolute w-48 transition-all duration-500 ease-out cursor-pointer"
            style={getCardStyle(index)}
            onClick={() => setCurrentIndex(index)}
          >
            <div className="relative group">
              {/* Card Glow Effect */}
              <div 
                className="absolute -inset-1 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ backgroundColor: RARITY_COLORS[card.rarity] || '#3B82F6' }}
              />
              
              {/* Card Container */}
              <div className="relative bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors">
                {/* Card Image */}
                <div className="aspect-[200/280] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Info */}
                <div className="p-3 bg-[#1A1A1A]">
                  <h3 className="text-white font-semibold text-sm truncate">{card.name}</h3>
                  
                  {/* Insured Value Badge */}
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-400 text-xs font-medium">${card.insuredValue.toLocaleString()}</span>
                  </div>

                  {/* Grade Badge */}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs">
                    <span className="text-gray-400">{card.grade.company}</span>
                    <span className="text-white font-bold">{card.grade.score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {FEATURED_CARDS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "w-6 bg-blue-500" 
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
