
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  ShoppingCart, 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  LogOut,
  MapPin,
  Utensils,
  Loader2,
  UtensilsCrossed,
  Soup,
  Store,
  Pizza,
  Beef,
  Flame,
  IceCreamCone,
  Coffee,
  Filter,
  X,
  Star,
  Leaf
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCart } from '@/lib/contexts/cart-context';
import FoodCard from '@/components/FoodCard';
import { personalizedFoodRecommendations } from '@/ai/flows/personalized-food-recommendations-flow';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const categoriesConfig = [
  { name: 'North Indian', icon: UtensilsCrossed, image: 'cat-north-indian' },
  { name: 'South Indian', icon: Soup, image: 'cat-south-indian' },
  { name: 'Street Food', icon: Store, image: 'cat-street-food' },
  { name: 'Fast Food', icon: Pizza, image: 'cat-fast-food' },
  { name: 'Chinese', icon: Beef, image: 'cat-chinese' },
  { name: 'Biryani', icon: Flame, image: 'cat-biryani' },
  { name: 'Sweets & Desserts', icon: IceCreamCone, image: 'cat-sweets' },
  { name: 'Beverages', icon: Coffee, image: 'cat-beverages' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const db = useFirestore();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Advanced Filters
  const [isVegOnly, setIsVegOnly] = useState<boolean | null>(null); // null = all, true = veg, false = non-veg
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch all available foods
  const foodsQuery = useMemoFirebase(() => collection(db, 'foods'), [db]);
  const { data: allFoods, isLoading: foodsLoading } = useCollection(foodsQuery);

  // Trending items
  const trendingQuery = useMemoFirebase(() => {
    return query(collection(db, 'foods'), where('trending', '==', true), limit(4));
  }, [db]);
  const { data: trendingFoods } = useCollection(trendingQuery);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  // AI Recommendations logic
  useEffect(() => {
    async function getPersonalizedRecommendations() {
      if (!user?.uid || !allFoods || allFoods.length === 0) return;
      
      setLoadingRecs(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', user.uid), 
          orderBy('orderDate', 'desc'), 
          limit(5)
        );
        const orderSnap = await getDocs(q);
        
        const history: { name: string; category?: string }[] = [];
        for (const orderDoc of orderSnap.docs) {
          const itemsRef = collection(db, 'orders', orderDoc.id, 'orderItems');
          const itemsSnap = await getDocs(itemsRef);
          itemsSnap.forEach(itemDoc => {
            const itemData = itemDoc.data();
            history.push({
              name: itemData.foodName,
              category: allFoods.find(f => f.id === itemData.foodId)?.category
            });
          });
        }

        const result = await personalizedFoodRecommendations({
          userFoodHistory: history.length > 0 ? history : [],
          availableFoods: allFoods.map(f => ({
            id: f.id,
            name: f.name,
            price: f.price,
            category: f.category,
            rating: f.rating,
            imageURL: f.imageURL
          }))
        });
        setRecommendations(result.recommendations);
      } catch (e) {
        console.error("Failed to fetch recommendations", e);
      } finally {
        setLoadingRecs(false);
      }
    }
    if (allFoods) getPersonalizedRecommendations();
  }, [user?.uid, allFoods, db]);

  // Filtering Logic
  const filteredFoods = useMemo(() => {
    return (allFoods || []).filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase()) || 
                            food.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
      const matchesVeg = isVegOnly === null ? true : food.isVeg === isVegOnly;
      const matchesPrice = food.price <= maxPrice;
      const matchesRating = food.rating >= minRating;

      return matchesSearch && matchesCategory && matchesVeg && matchesPrice && matchesRating;
    });
  }, [allFoods, search, selectedCategory, isVegOnly, maxPrice, minRating]);

  const activeFilterCount = (isVegOnly !== null ? 1 : 0) + (maxPrice < 1000 ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const resetFilters = () => {
    setIsVegOnly(null);
    setMaxPrice(1000);
    setMinRating(0);
    setSearch('');
    setSelectedCategory('All');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <span className="font-headline text-xl font-bold hidden md:block text-foreground">Bhartiya Swad</span>
          </div>

          <div className="flex-1 max-w-xl flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for dishes, cuisines..." 
                className="pl-10 h-11 bg-muted/50 border-none rounded-2xl w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
            
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-2xl gap-2 border-primary/20 hover:bg-primary/5 relative">
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="rounded-l-[2.5rem]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-2xl font-headline flex items-center gap-2">
                    <Filter className="w-6 h-6 text-primary" />
                    Advanced Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="py-8 space-y-10">
                  {/* Dietary Filter */}
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dietary Preference</label>
                    <div className="flex gap-2">
                      <Button 
                        variant={isVegOnly === null ? 'default' : 'outline'} 
                        onClick={() => setIsVegOnly(null)}
                        className="flex-1 rounded-xl h-12 font-bold"
                      >
                        All
                      </Button>
                      <Button 
                        variant={isVegOnly === true ? 'default' : 'outline'} 
                        onClick={() => setIsVegOnly(true)}
                        className={cn("flex-1 rounded-xl h-12 font-bold gap-2", isVegOnly === true ? 'bg-green-600' : 'hover:border-green-600 hover:text-green-600')}
                      >
                        <Leaf className="w-4 h-4" /> Veg
                      </Button>
                      <Button 
                        variant={isVegOnly === false ? 'default' : 'outline'} 
                        onClick={() => setIsVegOnly(false)}
                        className={cn("flex-1 rounded-xl h-12 font-bold gap-2", isVegOnly === false ? 'bg-red-600' : 'hover:border-red-600 hover:text-red-600')}
                      >
                        <Beef className="w-4 h-4" /> Non-Veg
                      </Button>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Price</label>
                      <span className="font-headline font-black text-primary text-lg">₹{maxPrice}</span>
                    </div>
                    <Slider 
                      value={[maxPrice]} 
                      max={1000} 
                      step={10} 
                      onValueChange={([val]) => setMaxPrice(val)}
                      className="py-4"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full text-[10px] font-black h-8" onClick={() => setMaxPrice(200)}>Under ₹200</Button>
                      <Button variant="outline" size="sm" className="rounded-full text-[10px] font-black h-8" onClick={() => setMaxPrice(500)}>Under ₹500</Button>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Minimum Rating</label>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-headline font-black text-lg">{minRating === 0 ? 'Any' : minRating + '+'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 4.5, 4.8].map((r) => (
                        <Button 
                          key={r}
                          variant={minRating === r ? 'default' : 'outline'}
                          onClick={() => setMinRating(minRating === r ? 0 : r)}
                          className="rounded-xl font-bold h-10"
                        >
                          {r}★
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <SheetFooter className="flex-col sm:flex-col gap-4 pt-6 border-t mt-auto">
                  <Button variant="ghost" className="w-full text-muted-foreground font-bold" onClick={resetFilters}>Reset All</Button>
                  <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => setShowFilters(false)}>Show Results</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative p-2 rounded-full">
                  <ShoppingCart className="w-6 h-6" />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                      {items.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col rounded-l-[2.5rem]">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-2xl font-headline flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    Your Basket
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 py-6">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                      <Utensils className="w-20 h-20 mb-4" />
                      <p className="font-bold text-lg">Your basket is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted relative">
                            <img src={item.imageURL} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-primary font-bold">₹{item.price}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm bg-muted px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-destructive">Remove</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {items.length > 0 && (
                  <SheetFooter className="pt-6 border-t flex-col sm:flex-col gap-4">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-lg font-bold">Subtotal</span>
                      <span className="text-2xl font-headline font-black text-primary">₹{totalPrice}</span>
                    </div>
                    <Button 
                      className="w-full h-14 bg-primary text-lg font-bold rounded-2xl shadow-xl shadow-primary/20"
                      onClick={() => {
                        alert("Order Placed Successfully!");
                        clearCart();
                      }}
                    >
                      Checkout Now
                    </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground self-center mr-2">Applied:</span>
            {isVegOnly !== null && (
              <Badge variant="secondary" className={cn("rounded-full px-4 py-1 gap-2 font-bold", isVegOnly ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50")}>
                {isVegOnly ? <Leaf className="w-3 h-3" /> : <Beef className="w-3 h-3" />}
                {isVegOnly ? 'Veg' : 'Non-Veg'}
                <X className="w-3 h-3 cursor-pointer ml-2" onClick={() => setIsVegOnly(null)} />
              </Badge>
            )}
            {maxPrice < 1000 && (
              <Badge variant="secondary" className="rounded-full px-4 py-1 gap-2 font-bold bg-primary/5 text-primary">
                Under ₹{maxPrice}
                <X className="w-3 h-3 cursor-pointer ml-2" onClick={() => setMaxPrice(1000)} />
              </Badge>
            )}
            {minRating > 0 && (
              <Badge variant="secondary" className="rounded-full px-4 py-1 gap-2 font-bold bg-yellow-50 text-yellow-700">
                <Star className="w-3 h-3 fill-current" />
                {minRating}+ Rating
                <X className="w-3 h-3 cursor-pointer ml-2" onClick={() => setMinRating(0)} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-black" onClick={resetFilters}>Clear All</Button>
          </div>
        )}
        
        {/* Explore Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-headline font-black mb-6 text-foreground">
            Explore <span className="text-primary italic">Categories</span>
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            <div 
              onClick={() => setSelectedCategory('All')}
              className={`flex-shrink-0 w-32 snap-start cursor-pointer group transition-all ${selectedCategory === 'All' ? 'scale-105' : ''}`}
            >
              <div className={`aspect-square rounded-[2rem] flex items-center justify-center border-4 transition-all duration-300 ${selectedCategory === 'All' ? 'border-primary bg-primary shadow-xl shadow-primary/20' : 'border-white bg-white hover:border-primary/20 shadow-sm'}`}>
                <Utensils className={`w-10 h-10 transition-colors ${selectedCategory === 'All' ? 'text-white' : 'text-primary'}`} />
              </div>
              <p className={`text-center mt-3 font-bold text-sm ${selectedCategory === 'All' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>All Dishes</p>
            </div>
            
            {categoriesConfig.map((cat) => {
              const placeholder = PlaceHolderImages.find(img => img.id === cat.image);
              const isActive = selectedCategory === cat.name;
              
              return (
                <div 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex-shrink-0 w-32 snap-start cursor-pointer group transition-all ${isActive ? 'scale-105' : ''}`}
                >
                  <div className={`relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-300 shadow-sm ${isActive ? 'border-primary shadow-xl shadow-primary/20' : 'border-white hover:border-primary/20'}`}>
                    {placeholder && (
                      <Image 
                        src={placeholder.imageUrl} 
                        alt={cat.name} 
                        fill 
                        className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isActive ? 'opacity-40 grayscale-0' : 'opacity-80 grayscale-[20%]'}`} 
                        data-ai-hint={placeholder.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <cat.icon className={`w-10 h-10 drop-shadow-lg transition-colors ${isActive ? 'text-white' : 'text-white'}`} />
                    </div>
                  </div>
                  <p className={`text-center mt-3 font-bold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>{cat.name}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trending Now Section */}
        {trendingFoods && trendingFoods.length > 0 && selectedCategory === 'All' && !search && activeFilterCount === 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-headline font-black flex items-center gap-3">
                <Flame className="w-8 h-8 text-accent animate-bounce" />
                Trending <span className="text-accent underline decoration-4 underline-offset-8">Now</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingFoods.map(food => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations Section */}
        {(recommendations.length > 0 || loadingRecs) && selectedCategory === 'All' && !search && activeFilterCount === 0 && (
          <div className="mb-16 bg-gradient-to-br from-primary/5 to-accent/5 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-headline font-black flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  Recommended For You
                </h2>
                <p className="text-muted-foreground mt-1 font-medium">Tailored tastes based on your order history</p>
              </div>
              {loadingRecs && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendations.map(food => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </div>
        )}

        {/* Main Specials Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-black flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              {search || activeFilterCount > 0 ? (
                <>
                  Search <span className="text-primary italic">Results</span>
                  <Badge variant="outline" className="font-bold text-muted-foreground">{filteredFoods.length} items</Badge>
                </>
              ) : (
                selectedCategory === 'All' ? 'Popular Dishes' : `${selectedCategory} Specials`
              )}
            </h2>
          </div>
          
          {foodsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredFoods.map(food => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </div>

        {!foodsLoading && filteredFoods.length === 0 && (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Utensils className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
            <p className="text-2xl text-foreground font-black">No dishes found</p>
            <p className="text-muted-foreground mt-2 max-w-sm font-medium">Try adjusting your filters or search query to find what you're looking for.</p>
            <Button variant="outline" className="mt-8 rounded-xl font-bold border-primary text-primary" onClick={resetFilters}>Clear Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
