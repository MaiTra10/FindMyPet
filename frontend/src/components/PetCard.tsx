import { motion } from "motion/react";
import { MapPin, Calendar, Heart, Eye, Dog, Cat, Rabbit, Bird, PawPrint } from "lucide-react";
import { PetListing } from "../types/pet";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface PetCardProps {
  pet: PetListing;
  onToggleFollow?: (id: string) => void;
}

export function PetCard({ pet, onToggleFollow }: PetCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Found":
        return "bg-blue-500";
      case "Stale":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getTypeIcon = (type: string): LucideIcon => {
    switch (type) {
      case "Dog":
        return Dog;
      case "Cat":
        return Cat;
      case "Bunny":
        return Rabbit;
      case "Bird":
        return Bird;
      default:
        return PawPrint;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border hover:shadow-2xl transition-all"
    >
      <Link to={`/pet/${pet.id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {pet.imageUrl ? (
            <ImageWithFallback
              src={pet.imageUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const IconComponent = getTypeIcon(pet.animalType);
                return <IconComponent className="w-16 h-16 text-muted-foreground" />;
              })()}
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(pet.status)} text-white border-0`}>
              {pet.status}
            </Badge>
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 backdrop-blur-sm border-0">
              {pet.type}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name and ID */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-foreground mb-1">{pet.name}</h3>
              <p className="text-xs text-muted-foreground">ID: {pet.id}</p>
            </div>
            {(() => {
              const IconComponent = getTypeIcon(pet.animalType);
              return <IconComponent className="w-6 h-6 text-muted-foreground" />;
            })()}
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded-lg">{pet.color}</span>
              {pet.breed && (
                <span className="px-2 py-1 bg-muted rounded-lg">{pet.breed}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{pet.location.address}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pet.dateReported)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleFollow?.(pet.id)}
          className={`flex-1 py-2 px-4 rounded-xl transition-all ${
            pet.isFollowed
              ? "bg-gradient-to-r from-primary to-accent text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Heart
            className={`w-4 h-4 inline mr-2 ${pet.isFollowed ? "fill-current" : ""}`}
          />
          {pet.isFollowed ? "Following" : "Follow"}
        </motion.button>

        <Link to={`/pet/${pet.id}`} className="flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 rounded-xl bg-muted hover:bg-muted/80 transition-all"
          >
            <Eye className="w-4 h-4 inline mr-2" />
            View
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
