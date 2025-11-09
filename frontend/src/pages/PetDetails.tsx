import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Heart, Share2, AlertCircle, Dog, Cat, Rabbit, Bird, PawPrint, CheckCircle2, Star, Trophy, Users, Zap, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { mockPets } from "../utils/mockData";
import { getPetListings } from "../utils/localStorage";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Progress } from "../components/ui/progress";
import * as LucideIcons from "lucide-react";
import { PetListing } from "../types/pet";

export function PetDetails() {
  const { id } = useParams();
  const [allPets, setAllPets] = useState<PetListing[]>([]);
  const [pet, setPet] = useState<PetListing | undefined>(undefined);
  const [isFollowing, setIsFollowing] = useState(false);

  // Load all pets from both localStorage and mockData
  useEffect(() => {
    const storedPets = getPetListings();
    const combinedPets = [...storedPets, ...mockPets];
    setAllPets(combinedPets);
    
    const foundPet = combinedPets.find((p) => p.id === id);
    setPet(foundPet);
    setIsFollowing(foundPet?.isFollowed || false);
  }, [id]);

  if (!pet) {
    return (
      <div className="min-h-screen ml-32 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground mb-2">Pet Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The pet you're looking for doesn't exist
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl"
          >
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

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
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen ml-32 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Back Button */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative rounded-3xl overflow-hidden bg-muted h-[500px]">
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
                    return <IconComponent className="w-32 h-32 text-muted-foreground" />;
                  })()}
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge className={`${getStatusColor(pet.status)} text-white border-0 text-lg px-4 py-2`}>
                  {pet.status}
                </Badge>
              </div>

              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 backdrop-blur-sm border-0 text-lg px-4 py-2">
                  {pet.type}
                </Badge>
              </div>
            </div>

            {/* Poster Profile Section */}
            {pet.postedBy && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-6"
              >
                <h4 className="text-muted-foreground">Posted By</h4>
                
                {/* User Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={pet.postedBy.avatar} alt={pet.postedBy.name} />
                    <AvatarFallback>{pet.postedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-foreground">{pet.postedBy.name}</h4>
                      {pet.postedBy.verificationsCount >= 5 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-primary/30 cursor-help">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span className="text-xs text-primary">Verified Helper</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This user has helped reunite {pet.postedBy.verificationsCount} pets with their families</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                      }).format(pet.postedBy.joinedDate)} • {pet.postedBy.daysActive} days active
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-background/60 rounded-xl">
                    <Heart className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">People Helped</p>
                      <p className="font-medium">{pet.postedBy.verificationsCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/60 rounded-xl">
                    <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sightings</p>
                      <p className="font-medium">{pet.postedBy.sightingsReported}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/60 rounded-xl">
                    <PawPrint className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Active Listings</p>
                      <p className="font-medium">{pet.postedBy.activeListings}/{pet.postedBy.listingsCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/60 rounded-xl">
                    <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Following</p>
                      <p className="font-medium">{pet.postedBy.followedPets}</p>
                    </div>
                  </div>
                </div>

                {/* Badges Section */}
                {pet.postedBy.badges && pet.postedBy.badges.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-amber-500" />
                      <h5 className="text-sm font-medium">Earned Badges ({pet.postedBy.badges.filter(b => b.earned).length})</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pet.postedBy.badges.filter(b => b.earned).slice(0, 6).map((badge) => {
                        // Get the icon component from lucide-react
                        const IconComponent = (LucideIcons as any)[badge.icon] || Award;
                        return (
                          <TooltipProvider key={badge.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-br ${badge.color} shadow-sm cursor-help`}
                                >
                                  <IconComponent className="w-3.5 h-3.5 text-white" />
                                  <span className="text-xs text-white font-medium">{badge.name}</span>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{badge.name}</p>
                                <p className="text-xs text-muted-foreground">{badge.description}</p>
                                {badge.progress && badge.requirement && (
                                  <p className="text-xs mt-1">Progress: {badge.progress}/{badge.requirement}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Community Impact */}
                {pet.postedBy.verificationsCount >= 5 && (
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Community Impact</p>
                    <p className="text-sm">
                      This trusted member has made a significant difference by helping 
                      <span className="font-medium text-primary"> {pet.postedBy.verificationsCount} families </span>
                      reunite with their beloved pets.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-foreground">{pet.name}</h1>
                {(() => {
                  const IconComponent = getTypeIcon(pet.animalType);
                  return <IconComponent className="w-8 h-8 text-muted-foreground" />;
                })()}
              </div>
              <p className="text-muted-foreground">ID: {pet.id}</p>
            </div>

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="text-foreground">{pet.animalType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="text-foreground">{pet.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Color</p>
                  <p className="text-foreground">{pet.color}</p>
                </div>
                {pet.breed && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Breed</p>
                    <p className="text-foreground">{pet.breed}</p>
                  </div>
                )}
                {pet.age && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age</p>
                    <p className="text-foreground">{pet.age}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Date */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Seen Location
                  </p>
                  <p className="text-foreground">{pet.location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Date Reported
                  </p>
                  <p className="text-foreground">{formatDate(pet.dateReported instanceof Date ? pet.dateReported : new Date(pet.dateReported))}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {pet.description && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h4 className="text-foreground mb-3">Description</h4>
                <p className="text-muted-foreground">{pet.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFollowing ? "fill-current" : ""}`}
                />
                {isFollowing ? "Following" : "Follow"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-4 px-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>

            {/* Contact */}
            {pet.type === "Lost" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-accent/20 border border-primary/30 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-foreground mb-2">Seen This Pet?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you have any information about {pet.name}, please contact
                      the owner or report a sighting.
                    </p>
                    <Link to="/report">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl"
                      >
                        Report Sighting
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
