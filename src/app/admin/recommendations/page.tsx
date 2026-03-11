
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, User, Utensils } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { personalizedFoodRecommendations } from '@/ai/flows/personalized-food-recommendations-flow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminRecommendationsPage() {
  const db = useFirestore();
  const [activeRecs, setActiveRecs] = useState<Record<string, any[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: users } = useCollection(usersQuery);

  const foodsQuery = useMemoFirebase(() => collection(db, 'foods'), [db]);
  const { data: foods } = useCollection(foodsQuery);

  const generateForUser = async (userId: string, userName: string) => {
    setLoadingMap(prev => ({ ...prev, [userId]: true }));
    try {
      // In a real app, we'd fetch the user's real order history from 'orders' collection
      // For this prototype, we'll mock some preferences
      const mockHistory = [
        { name: 'Paneer Butter Masala', category: 'North Indian' },
        { name: 'Masala Dosa', category: 'South Indian' }
      ];

      const result = await personalizedFoodRecommendations({
        userFoodHistory: mockHistory,
        availableFoods: foods || []
      });

      setActiveRecs(prev => ({ ...prev, [userId]: result.recommendations }));
    } catch (e) {
      console.error("Recommendation failed", e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-headline font-black mb-2 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-primary" />
          AI Recommendation System
        </h1>
        <p className="text-muted-foreground">Preview and generate personalized food suggestions for your customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users?.map((user) => (
          <Card key={user.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-all border-t-4 border-primary/20">
            <CardHeader className="bg-muted/30 p-8 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-headline font-bold">{user.displayName || 'Guest'}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Customer ID: {user.id.slice(0, 8)}</p>
                </div>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold shadow-lg shadow-primary/10"
                onClick={() => generateForUser(user.id, user.displayName)}
                disabled={loadingMap[user.id] || !foods}
              >
                {loadingMap[user.id] ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                Generate Suggestions
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b pb-2">Recommended Items</h4>
                {activeRecs[user.id] ? (
                  <ScrollArea className="h-48 pr-4">
                    <div className="space-y-3">
                      {activeRecs[user.id].map((food, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted relative overflow-hidden">
                              <img src={food.imageURL} alt={food.name} className="object-cover w-full h-full" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{food.name}</p>
                              <p className="text-[10px] text-muted-foreground">{food.category}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full">₹{food.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center opacity-30 text-center">
                    <Utensils className="w-12 h-12 mb-2" />
                    <p className="text-sm font-bold">No recommendations generated yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
