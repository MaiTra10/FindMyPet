import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

const catsData = [
  {
    id: 1,
    name: "Whiskers Wonder",
    description: "The most adorable fluffy friend you'll ever meet!",
    imageUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0fGVufDF8fHx8MTc2MjUzNjg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Playful", "Affectionate", "Curious"],
    funFacts: [
      "Loves to chase laser pointers",
      "Favorite food: Tuna treats",
      "Expert at knocking things off tables",
      "Can sleep up to 16 hours a day",
    ],
    age: "2 years old",
    color: "Calico",
  },
  {
    id: 2,
    name: "Playful Paws",
    description: "Always ready for an adventure and some fun!",
    imageUrl: "https://images.unsplash.com/photo-1621854065840-8a83d8a97009?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5ZnVsJTIwa2l0dGVufGVufDF8fHx8MTc2MjU0NDI5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Energetic", "Adventurous", "Social"],
    funFacts: [
      "Champion toy hunter",
      "Loves to explore",
      "Makes friends with everyone",
      "Has the zoomies daily at 3 AM",
    ],
    age: "1 year old",
    color: "Tabby",
  },
  {
    id: 3,
    name: "Sleepy Snuggles",
    description: "Expert napper and cozy companion extraordinaire.",
    imageUrl: "https://images.unsplash.com/photo-1482066490729-6f26115b60dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGVlcGluZyUyMGNhdHxlbnwxfHx8fDE3NjI1NzA5OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Calm", "Gentle", "Cuddly"],
    funFacts: [
      "World record holder for longest nap",
      "Purrs like a motor",
      "Loves warm blankets",
      "Professional lap warmer",
    ],
    age: "5 years old",
    color: "Gray",
  },
  {
    id: 4,
    name: "Majestic Meow",
    description: "Royalty in feline form with stunning features.",
    imageUrl: "https://images.unsplash.com/photo-1647806422508-0322f33e270b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI0ODYzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Regal", "Independent", "Intelligent"],
    funFacts: [
      "Demands royal treatment",
      "Has perfect posture",
      "Judges you silently",
      "Only responds to polite requests",
    ],
    age: "3 years old",
    color: "White & Gray",
  },
  {
    id: 5,
    name: "Fluffy Cloud",
    description: "So soft and fluffy, like a walking cloud!",
    imageUrl: "https://images.unsplash.com/photo-1654673131239-e45496600741?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbHVmZnklMjBjYXR8ZW58MXx8fHwxNzYyNTcwOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Sweet", "Shy", "Gentle"],
    funFacts: [
      "Fur maintenance: 3 hours daily",
      "Hates water but loves grooming",
      "Looks like a cotton ball",
      "Professional biscuit maker",
    ],
    age: "4 years old",
    color: "White Persian",
  },
  {
    id: 6,
    name: "Ginger Snap",
    description: "Vibrant orange tabby with loads of personality!",
    imageUrl: "https://images.unsplash.com/photo-1667518158890-0a6cf60de601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjB0YWJieSUyMGNhdHxlbnwxfHx8fDE3NjI0OTU3ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    personality: ["Sassy", "Vocal", "Loving"],
    funFacts: [
      "Has an opinion about everything",
      "Talks back when spoken to",
      "Master of dramatic entrances",
      "Food motivated (very)",
    ],
    age: "2 years old",
    color: "Orange Tabby",
  },
];

export function CatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const cat = catsData.find((c) => c.id === Number(id));

  if (!cat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cat not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-8 ml-28">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/")}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-card rounded-full shadow-lg hover:shadow-xl transition-shadow border border-border"
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Gallery</span>
      </motion.button>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Floating Sparkle */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-6 right-6"
              >
                <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              {/* Action Buttons */}
              <div className="absolute bottom-6 right-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                >
                  <Share2 className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <motion.h1
                className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                {cat.name}
              </motion.h1>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {cat.description}
              </motion.p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-border"
              >
                <p className="text-muted-foreground text-sm mb-1">Age</p>
                <p>{cat.age}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl border border-border"
              >
                <p className="text-muted-foreground text-sm mb-1">Color</p>
                <p>{cat.color}</p>
              </motion.div>
            </div>

            {/* Personality Traits */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                Personality Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.personality.map((trait, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Fun Facts */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Fun Facts
              </h3>
              <div className="space-y-3">
                {cat.funFacts.map((fact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>{fact}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Decorations */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="fixed bottom-40 right-40 opacity-20 pointer-events-none"
      >
        <Sparkles className="w-24 h-24 text-primary" />
      </motion.div>
    </div>
  );
}
