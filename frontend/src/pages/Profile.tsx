import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  Award,
  Heart,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  Star,
  Trophy,
  Target,
  Zap
} from "lucide-react";
import { PetCard } from "../components/PetCard";
import { PetListing } from "../types/pet";
import { useState, useEffect } from "react";
import { useUser } from "../components/UserContext";
interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: typeof Award;
  earned: boolean;
  progress?: number;
  requirement?: number;
  color: string;
}

interface UserStats {
  totalListings: number;
  activeListings: number;
  peopleHelped: number;
  sightingsReported: number;
  followedPets: number;
  daysActive: number;
}

export function Profile() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"listings" | "badges" | "stats">("listings");
  const [userListings, setUserListings] = useState<PetListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  useEffect(() => {
    if (!user) return;
    // fetch user listings
  }, [user]);

  // TODO: Replace with your API call
  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user) return;

      setIsLoadingListings(true);
      try {
        // Example API call structure:
        // const response = await fetch(`YOUR_API_ENDPOINT/users/${user.id}/listings`);
        // const data = await response.json();
        // setUserListings(data);

        // For now, listings will be empty until you implement your API
        setUserListings([]);
      } catch (error) {
        console.error('Error fetching user listings:', error);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchUserListings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center ml-32">
        <div className="text-center">
          <h2 className="text-foreground mb-2">Not Signed In</h2>
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  // Mock user stats - in production, fetch from backend
  const userStats: UserStats = {
    totalListings: 3,
    activeListings: 2,
    peopleHelped: 12,
    sightingsReported: 8,
    followedPets: 5,
    daysActive: 45,
  };

  // Mock badges system
  const badges: UserBadge[] = [
    {
      id: "first-listing",
      name: "First Step",
      description: "Created your first listing",
      icon: Star,
      earned: true,
      color: "from-yellow-400 to-orange-400",
    },
    {
      id: "helper-5",
      name: "Community Helper",
      description: "Helped 5 people find their pets",
      icon: Heart,
      earned: true,
      color: "from-pink-400 to-rose-400",
    },
    {
      id: "helper-10",
      name: "Guardian Angel",
      description: "Helped 10 people find their pets",
      icon: Trophy,
      earned: true,
      progress: 12,
      requirement: 10,
      color: "from-purple-400 to-indigo-400",
    },
    {
      id: "sighter-5",
      name: "Eagle Eye",
      description: "Reported 5 sightings",
      icon: MapPin,
      earned: true,
      color: "from-blue-400 to-cyan-400",
    },
    {
      id: "sighter-10",
      name: "Neighborhood Watch",
      description: "Reported 10 sightings",
      icon: Target,
      earned: false,
      progress: 8,
      requirement: 10,
      color: "from-green-400 to-emerald-400",
    },
    {
      id: "active-30",
      name: "Dedicated Member",
      description: "Active for 30 days",
      icon: Zap,
      earned: true,
      progress: 45,
      requirement: 30,
      color: "from-amber-400 to-yellow-400",
    },
    {
      id: "follower-10",
      name: "Pet Advocate",
      description: "Following 10 pets",
      icon: Users,
      earned: false,
      progress: 5,
      requirement: 10,
      color: "from-teal-400 to-cyan-400",
    },
    {
      id: "reunion",
      name: "Reunion Hero",
      description: "Helped reunite a pet with their family",
      icon: CheckCircle2,
      earned: false,
      progress: 0,
      requirement: 1,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const earnedBadges = badges.filter(b => b.earned);
  const inProgressBadges = badges.filter(b => !b.earned);

  return (
    <div className="min-h-screen pt-8 pb-20 px-8 ml-32">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-foreground">{user.name}</h1>
                  {userStats.peopleHelped >= 5 && (
                    <Badge className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Helper
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-xl relative">
                    <Heart className="w-4 h-4 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">People Helped</p>
                        {userStats.peopleHelped >= 5 && (
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <p className="font-medium">{userStats.peopleHelped}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-xl">
                    <MapPin className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sightings</p>
                      <p className="font-medium">{userStats.sightingsReported}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-xl">
                    <Award className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Badges</p>
                      <p className="font-medium">{earnedBadges.length}/{badges.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-xl">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Days Active</p>
                      <p className="font-medium">{userStats.daysActive}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("listings")}
            className={`px-6 py-3 rounded-xl transition-all ${activeTab === "listings"
              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
              : "bg-card hover:bg-muted"
              }`}
          >
            My Listings ({userStats.activeListings})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("badges")}
            className={`px-6 py-3 rounded-xl transition-all ${activeTab === "badges"
              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
              : "bg-card hover:bg-muted"
              }`}
          >
            Badges ({earnedBadges.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 rounded-xl transition-all ${activeTab === "stats"
              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
              : "bg-card hover:bg-muted"
              }`}
          >
            Stats & Impact
          </motion.button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Listings Tab */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              {userListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onToggleFollow={() => {
                        // Handle follow toggle
                        console.log("Toggle follow for", pet.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No active listings yet</p>
                </Card>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <div className="space-y-6">
              {/* Earned Badges */}
              <div>
                <h3 className="text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Earned Badges ({earnedBadges.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {earnedBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="p-4 text-center bg-gradient-to-br from-background to-muted border-2 border-primary/20 h-56 flex flex-col">
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-medium mb-1">{badge.name}</h4>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          {badge.progress && badge.requirement && (
                            <div className="mt-3">
                              <Badge variant="secondary" className="text-xs">
                                {badge.progress}/{badge.requirement}
                              </Badge>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* In Progress Badges */}
              {inProgressBadges.length > 0 && (
                <div>
                  <h3 className="text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    In Progress ({inProgressBadges.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inProgressBadges.map((badge) => {
                      const Icon = badge.icon;
                      const progressPercent = badge.progress && badge.requirement
                        ? (badge.progress / badge.requirement) * 100
                        : 0;

                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="p-4 bg-card/50">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} opacity-40 flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium mb-1">{badge.name}</h4>
                                <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                                {badge.progress !== undefined && badge.requirement && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Progress</span>
                                      <span className="font-medium">{badge.progress}/{badge.requirement}</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Impact Overview */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-foreground">Your Impact</h2>
                    <p className="text-sm text-muted-foreground">Making a difference in your community</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">People Helped</span>
                        <span className="font-medium text-primary">{userStats.peopleHelped}</span>
                      </div>
                      <Progress value={(userStats.peopleHelped / 20) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Goal: 20 people</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Sightings Reported</span>
                        <span className="font-medium text-accent">{userStats.sightingsReported}</span>
                      </div>
                      <Progress value={(userStats.sightingsReported / 15) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Goal: 15 sightings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active Listings</span>
                        <span className="font-medium text-blue-500">{userStats.activeListings}</span>
                      </div>
                      <Progress value={(userStats.activeListings / 5) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Max: 5 listings</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Days Active</span>
                        <span className="font-medium text-amber-500">{userStats.daysActive}</span>
                      </div>
                      <Progress value={(userStats.daysActive / 90) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Milestone: 90 days</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Verified Helper Status */}
              {userStats.peopleHelped >= 5 ? (
                <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2 flex items-center gap-2">
                        <span>🎉 Verified Helper Status Unlocked!</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You've helped {userStats.peopleHelped} people reunite with their pets! Your profile now displays the Verified Helper badge, showing the community you're a trusted and active member making a real difference.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-muted/50 border-dashed">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">Verified Helper Status</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Help 5 people reunite with their pets to unlock the Verified Helper badge.
                        You're currently at {userStats.peopleHelped}/5. Keep reporting sightings and helping the community!
                      </p>
                      <Progress value={(userStats.peopleHelped / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </Card>
              )}

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Community Impact</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{userStats.peopleHelped}</p>
                  <p className="text-sm text-muted-foreground">People helped find their pets</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-medium">Sightings</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{userStats.sightingsReported}</p>
                  <p className="text-sm text-muted-foreground">Helpful reports submitted</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="font-medium">Following</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{userStats.followedPets}</p>
                  <p className="text-sm text-muted-foreground">Pets you're tracking</p>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
