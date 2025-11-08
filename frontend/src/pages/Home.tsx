import { motion } from "motion/react";
import { CatCard } from "../components/CatCard";
import { Sparkles, Star } from "lucide-react";

const cats = [
  {
    id: 1,
    name: "Whiskers Wonder",
    description: "The most adorable fluffy friend you'll ever meet! 🐱",
    imageUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0fGVufDF8fHx8MTc2MjUzNjg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-pink-300",
  },
  {
    id: 2,
    name: "Playful Paws",
    description: "Always ready for an adventure and some fun! 🎾",
    imageUrl: "https://images.unsplash.com/photo-1621854065840-8a83d8a97009?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5ZnVsJTIwa2l0dGVufGVufDF8fHx8MTc2MjU0NDI5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-purple-300",
  },
  {
    id: 3,
    name: "Sleepy Snuggles",
    description: "Expert napper and cozy companion extraordinaire. 😴",
    imageUrl: "https://images.unsplash.com/photo-1482066490729-6f26115b60dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGVlcGluZyUyMGNhdHxlbnwxfHx8fDE3NjI1NzA5OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-blue-300",
  },
  {
    id: 4,
    name: "Majestic Meow",
    description: "Royalty in feline form with stunning features. 👑",
    imageUrl: "https://images.unsplash.com/photo-1647806422508-0322f33e270b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI0ODYzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-yellow-300",
  },
  {
    id: 5,
    name: "Fluffy Cloud",
    description: "So soft and fluffy, like a walking cloud! ☁️",
    imageUrl: "https://images.unsplash.com/photo-1654673131239-e45496600741?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbHVmZnklMjBjYXR8ZW58MXx8fHwxNzYyNTcwOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-indigo-300",
  },
  {
    id: 6,
    name: "Ginger Snap",
    description: "Vibrant orange tabby with loads of personality! 🧡",
    imageUrl: "https://images.unsplash.com/photo-1667518158890-0a6cf60de601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjB0YWJieSUyMGNhdHxlbnwxfHx8fDE3NjI0OTU3ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "border-orange-300",
  },
];

export function Home() {
  return (
    <div className="min-h-screen py-12 px-8 ml-28">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
          <Star className="w-6 h-6 text-secondary" />
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>

        <h1 className="mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Welcome to Purrfect Pals! 🐾
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Discover the most adorable collection of feline friends! Each cat has
          their own unique personality and charm. Click on any card to learn
          more about these amazing companions.
        </motion.p>
      </motion.div>

      {/* Cat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {cats.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <CatCard {...cat} />
          </motion.div>
        ))}
      </div>

      {/* Floating Elements */}
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
        className="fixed bottom-20 right-20 opacity-30"
      >
        <Sparkles className="w-16 h-16 text-primary" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="fixed top-20 right-40 opacity-20"
      >
        <Star className="w-12 h-12 text-secondary" />
      </motion.div>
    </div>
  );
}
