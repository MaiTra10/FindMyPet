import { motion } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "./imgWithFallback/ImageWithFallback";

interface CatCardProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  color: string;
}

export function CatCard({ id, name, description, imageUrl, color }: CatCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Link to={`/cat/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10, scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="relative group cursor-pointer"
      >
        <div className={`relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-shadow bg-card border-2 ${color}`}>
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Floating Sparkles */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
            </motion.div>

            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.h3
              className="mb-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {name}
            </motion.h3>
            <motion.p
              className="text-muted-foreground"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          </div>

          {/* Hover Effect Border */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-4 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0px rgba(232, 121, 249, 0)",
                "0 0 20px rgba(232, 121, 249, 0.3)",
                "0 0 0px rgba(232, 121, 249, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </Link>
  );
}
