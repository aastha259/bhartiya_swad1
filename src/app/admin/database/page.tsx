
"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Search, Database, Sparkles, Loader2, Leaf, Beef } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, updateDoc, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES_DATA = [
  { name: 'Pizza', seed: 'pizza' },
  { name: 'Burgers', seed: 'burger' },
  { name: 'Biryani', seed: 'biryani' },
  { name: 'North Indian', seed: 'curry' },
  { name: 'South Indian', seed: 'dosa' },
  { name: 'Chinese', seed: 'noodles' },
  { name: 'Fast Food', seed: 'fast-food' },
  { name: 'Street Food', seed: 'chaat' },
  { name: 'Rolls & Wraps', seed: 'wrap' },
  { name: 'Sandwiches', seed: 'sandwich' },
  { name: 'Pasta', seed: 'pasta' },
  { name: 'Salads', seed: 'salad' },
  { name: 'Desserts', seed: 'sweets' },
  { name: 'Ice Cream', seed: 'icecream' },
  { name: 'Beverages', seed: 'drinks' },
];

const DISH_NAMING_TEMPLATES: Record<string, { veg: string[], nonVeg: string[] }> = {
  'Pizza': {
    veg: ['Margherita', 'Farmhouse', 'Paneer Tikka', 'Veggie Delight', 'Cheese Burst', 'Classic Veg', 'Double Cheese', 'Corn & Cheese', 'Capsicum Special', 'Mushroom Lovers', 'Onion Ring', 'Garden Fresh', 'Spicy Paneer', 'Ultimate Veg', 'Double Paneer', 'Indian Feast', 'Veggie Paradise', 'Cloud 9', 'Mediterranean Veg', 'Pesto Paneer', 'Garlic Bread Pizza', 'Exotic Veggie', 'Tandoori Veg', 'Green Wave', 'Zesty Veg'],
    nonVeg: ['Chicken Golden Delight', 'Non Veg Supreme', 'Chicken Dominator', 'Pepper Barbecue Chicken', 'Chicken Fiesta', 'Indi Chicken Tikka', 'Spicy Chicken', 'Chicken Keema', 'Meatball Special', 'Bacon & Cheese', 'Peri Peri Chicken', 'Afghani Chicken']
  },
  'Biryani': {
    veg: ['Hyderabadi Veg Biryani', 'Paneer Dum Biryani', 'Mushroom Biryani', 'Kolkata Style Veg Biryani', 'Lucknowi Tarkari Biryani', 'Subz-e-Biryani', 'Veg Pulao Special', 'Jackfruit Biryani', 'Soya Biryani', 'Mixed Bean Biryani', 'Kashmiri Veg Biryani', 'Ambur Veg Biryani', 'Thalassery Veg Biryani'],
    nonVeg: ['Chicken Dum Biryani', 'Mutton Dum Biryani', 'Egg Biryani', 'Ambur Chicken Biryani', 'Malabar Mutton Biryani', 'Tandoori Chicken Biryani', 'Chicken 65 Biryani', 'Spicy Mutton Biryani', 'Donne Biryani Chicken']
  },
  'North Indian': {
    veg: ['Paneer Butter Masala', 'Dal Makhani', 'Shahi Paneer', 'Malai Kofta', 'Mix Veg', 'Palak Paneer', 'Chole Masala', 'Kadai Paneer', 'Jeera Aloo', 'Aloo Gobi', 'Baingan Bharta', 'Navratan Korma', 'Dum Aloo', 'Matar Paneer', 'Kadai Vegetable', 'Dal Tadka', 'Rajma Chawal', 'Paneer Lababdar', 'Methi Matar Malai', 'Vegetable Jalfrezi'],
    nonVeg: ['Butter Chicken', 'Chicken Tikka Masala', 'Mutton Rogan Josh', 'Chicken Curry', 'Rara Chicken', 'Mutton Korma', 'Handi Chicken', 'Kadai Chicken', 'Chicken Do Pyaza', 'Mutton Masala', 'Egg Curry Special']
  },
  'Chinese': {
    veg: ['Veg Hakka Noodles', 'Veg Manchurian', 'Schezwan Noodles', 'Veg Fried Rice', 'Chili Paneer', 'Honey Chili Potato', 'Veg Spring Rolls', 'Crispy Corn', 'Veg Momos', 'Chowmein Special', 'Gobi Manchurian', 'Mushroom Chili', 'Baby Corn Chili', 'Schezwan Fried Rice', 'Singapuri Noodles'],
    nonVeg: ['Chicken Hakka Noodles', 'Chicken Manchurian', 'Chili Chicken', 'Chicken Fried Rice', 'Dragon Chicken', 'Chicken Lollipops', 'Chicken Momos', 'Garlic Chicken', 'Lemon Chicken', 'Schezwan Chicken']
  },
  'Desserts': {
    veg: ['Gulab Jamun', 'Rasmalai', 'Chocolate Lava Cake', 'Brownie with Ice Cream', 'Kheer', 'Gajar ka Halwa', 'Pastry', 'Cupcake', 'Waffles', 'Kulfi', 'Jalebi', 'Rabri', 'Rasgulla', 'Mysore Pak', 'Barfi', 'Laddu', 'Peda', 'Sandesh', 'Halwa Special', 'Fruit Custard', 'Bread Pudding', 'Tiramisu', 'Cheesecake', 'Mousse'],
    nonVeg: []
  },
};

export default function AdminDatabasePage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const dishesQuery = useMemoFirebase(() => collection(db, 'dishes'), [db]);
  const { data: dishes } = useCollection(dishesQuery);

  const restaurantsQuery = useMemoFirebase(() => collection(db, 'restaurants'), [db]);
  const { data: restaurants } = useCollection(restaurantsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const handleDelete = async (collName: string, id: string) => {
    if (confirm(`Are you sure you want to delete this document from ${collName}?`)) {
      await deleteDoc(doc(db, collName, id));
      toast({ title: "Deleted", description: "Document removed successfully." });
    }
  };

  const handleBootstrap = async () => {
    setIsBootstrapping(true);
    try {
      const restaurantId = restaurants?.[0]?.id || 'admin-root';
      let totalCreated = 0;

      for (const cat of CATEGORIES_DATA) {
        const templates = DISH_NAMING_TEMPLATES[cat.name] || { 
          veg: [`Classic ${cat.name}`, `Special ${cat.name}`, `Spicy ${cat.name}`, `Gourmet ${cat.name}`, `Chef's ${cat.name}`, `Royal ${cat.name}`, `Supreme ${cat.name}`, `Garden ${cat.name}`], 
          nonVeg: [`Chicken ${cat.name}`, `Mutton ${cat.name}`, `Egg ${cat.name}`, `Peri Peri ${cat.name}`] 
        };

        const generateDishes = async (names: string[], isVeg: boolean) => {
          for (const baseName of names) {
            // Generate variations to reach 30-40 per category
            const variations = [
              baseName,
              `Double ${baseName}`,
              `Spicy ${baseName}`,
              `Classic ${baseName}`,
              `${baseName} Platter`
            ].slice(0, Math.ceil(Math.random() * 3) + 1);

            for (const name of variations) {
              if (totalCreated >= 550) break;
              
              const q = query(collection(db, 'dishes'), where('name', '==', name));
              const snap = await getDocs(q);
              
              if (snap.empty) {
                await addDoc(collection(db, 'dishes'), {
                  name,
                  category: cat.name,
                  price: 150 + Math.floor(Math.random() * 35) * 10,
                  description: `Indulge in our signature ${name}. Prepared with the finest ingredients and traditional recipes to ensure an authentic taste experience.`,
                  image: `https://picsum.photos/seed/${name.replace(/\s/g, '-')}/800/600`,
                  rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
                  isVeg,
                  restaurantId: restaurantId,
                  totalOrders: Math.floor(Math.random() * 500),
                  totalRevenue: 0,
                  createdAt: new Date().toISOString()
                });
                totalCreated++;
              }
            }
          }
        };

        await generateDishes(templates.veg, true);
        await generateDishes(templates.nonVeg, false);
      }

      toast({
        title: "Database Mega-Seed Complete",
        description: `Successfully synchronized ${totalCreated} dishes across all categories.`
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Bootstrap Failed", description: e.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleAddDish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDish = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      restaurantId: restaurants?.[0]?.id || 'admin-root',
      description: formData.get('description') as string,
      image: `https://picsum.photos/seed/${Math.floor(Math.random() * 10000)}/800/600`,
      rating: 4.5,
      isVeg: formData.get('isVeg') === 'on',
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'dishes'), newDish);
    setIsAddDishOpen(false);
    toast({ title: "Dish Added", description: `${newDish.name} is now live.` });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black mb-2 flex items-center gap-3">
            <Database className="w-10 h-10 text-primary" />
            Dish Repository
          </h1>
          <p className="text-muted-foreground font-medium">Manage and seed your 500+ dish database here.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleBootstrap} 
            disabled={isBootstrapping}
            className="rounded-xl border-primary text-primary hover:bg-primary/5 font-bold h-11"
          >
            {isBootstrapping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Sync 500+ Dishes
          </Button>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search dishes..." 
              className="pl-10 h-11 bg-white rounded-xl border shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="dishes" className="w-full">
        <TabsList className="bg-white border p-1 rounded-2xl h-14 mb-8 shadow-sm flex overflow-x-auto no-scrollbar">
          <TabsTrigger value="dishes" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Full Menu</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Categories</TabsTrigger>
          <TabsTrigger value="restaurants" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="dishes">
          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="p-6 border-b flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-lg">Catalog ({dishes?.length || 0})</h3>
              <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Manual Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline font-black text-2xl text-primary">Add New Dish</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddDish} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Dish Name</Label>
                      <Input id="name" name="name" required placeholder="e.g. Paneer Butter Masala" className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input id="price" name="price" type="number" required placeholder="320" className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select name="category" className="w-full h-10 px-3 border rounded-xl bg-white text-sm" required>
                          {CATEGORIES_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" placeholder="Short and tasty description..." className="rounded-xl" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isVeg" name="isVeg" defaultChecked className="w-4 h-4 rounded border-green-600 text-green-600 accent-green-600" />
                      <Label htmlFor="isVeg">Vegetarian</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full rounded-xl font-bold bg-primary h-12">Save Dish</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="max-h-[700px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-bold p-6">Dish</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dishes?.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((dish) => (
                    <TableRow key={dish.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border bg-muted shrink-0">
                            <img src={dish.image} alt={dish.name} className="object-cover w-full h-full" />
                          </div>
                          <span className="font-bold text-sm">{dish.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dish.isVeg ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Veg</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Non-Veg</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full text-[10px]">{dish.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary">₹{dish.price}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={() => handleDelete('dishes', dish.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold p-6">Category</TableHead>
                  <TableHead className="font-bold text-right pr-6">Dishes Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIES_DATA.map((cat) => (
                  <TableRow key={cat.name}>
                    <TableCell className="p-6 font-bold">{cat.name}</TableCell>
                    <TableCell className="text-right pr-6 font-bold text-muted-foreground">
                      {dishes?.filter(d => d.category === cat.name).length || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
