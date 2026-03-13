
"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Search, Database, Sparkles, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const CATEGORIES_DATA = [
  { name: 'Pizza', search: 'pizza' },
  { name: 'Burgers', search: 'burger' },
  { name: 'Biryani', search: 'biryani' },
  { name: 'North Indian', search: 'curry' },
  { name: 'South Indian', search: 'dosa' },
  { name: 'Chinese', search: 'noodles' },
  { name: 'Fast Food', search: 'fries' },
  { name: 'Street Food', search: 'samosa' },
  { name: 'Rolls & Wraps', search: 'wrap' },
  { name: 'Sandwiches', search: 'sandwich' },
  { name: 'Pasta', search: 'pasta' },
  { name: 'Salads', search: 'salad' },
  { name: 'Desserts', search: 'sweets' },
  { name: 'Ice Cream', search: 'icecream' },
  { name: 'Beverages', search: 'drinks' },
];

const DISH_TEMPLATES: Record<string, string[]> = {
  'Pizza': ['Margherita Pizza', 'Farmhouse Pizza', 'Paneer Tikka Pizza', 'Veggie Delight Pizza', 'Cheese Burst Pizza', 'Classic Veg Pizza', 'Double Cheese Pizza', 'Corn & Cheese Pizza', 'Capsicum Special Pizza', 'Mushroom Lovers Pizza', 'Garden Fresh Pizza', 'Spicy Paneer Pizza', 'Ultimate Veg Pizza', 'Double Paneer Pizza', 'Tandoori Pizza', 'Mexican Green Wave', 'Peppy Paneer Pizza', 'Veg Extravaganza', 'Cheese n Corn', 'Indi Tandoori Paneer', '7 Cheese Pizza', 'Kadhai Paneer Pizza', 'Makhani Paneer Pizza', 'Fresh Veggie Pizza', 'Spicy Triple Tango', 'Classic Onion Pizza', 'Classic Golden Corn', 'Cheese n Tomato', 'Crispy Veg Pizza', 'Fiery Jalapeno Pizza', 'Exotic Veggie Pizza', 'Zesty Paneer Pizza', 'Sizzling Veg Pizza', 'Smoky Paneer Pizza', 'Royal Veggie Pizza'],
  'Biryani': ['Hyderabadi Veg Biryani', 'Paneer Dum Biryani', 'Mushroom Biryani', 'Kolkata Style Veg Biryani', 'Lucknowi Tarkari Biryani', 'Subz-e-Biryani', 'Veg Pulao Special', 'Jackfruit Biryani', 'Soya Biryani', 'Mixed Bean Biryani', 'Kashmiri Veg Biryani', 'Ambur Veg Biryani', 'Thalassery Veg Biryani', 'Sindhi Veg Biryani', 'Malabar Veg Biryani', 'Handi Biryani', 'Shahi Veg Biryani', 'Dum Pukht Biryani', 'Zafrani Veg Biryani', 'Noorani Biryani', 'Kacchi Veg Biryani', 'Bohri Veg Biryani', 'Donne Biryani', 'Tahiri Special', 'Afghani Veg Biryani', 'Nawabi Paneer Biryani', 'Deccani Biryani', 'Saffron Rice Special', 'Vegetable Tehri', 'Dindigul Veg Biryani', 'Bhatkali Veg Biryani', 'Memoni Veg Biryani', 'Kalyani Veg Biryani', 'Beary Veg Biryani', 'Rawther Biryani'],
  'North Indian': ['Paneer Butter Masala', 'Dal Makhani', 'Shahi Paneer', 'Malai Kofta', 'Mix Veg', 'Palak Paneer', 'Chole Masala', 'Kadai Paneer', 'Jeera Aloo', 'Aloo Gobi', 'Baingan Bharta', 'Navratan Korma', 'Dum Aloo', 'Matar Paneer', 'Kadai Vegetable', 'Bhindi Masala', 'Methi Matar Malai', 'Rajma Chawal Special', 'Kadhai Mushroom', 'Aloo Do Pyaza', 'Paneer Lababdar', 'Paneer Pasanda', 'Kashmiri Dum Aloo', 'Tawa Paneer', 'Paneer Bhurji', 'Dal Tadka', 'Dal Fry', 'Veg Jalfrezi', 'Mushroom Masala', 'Gobi Matar', 'Aloo Shimla Mirch', 'Veg Kofta', 'Sarson Ka Saag', 'Pindi Chole', 'Achari Paneer'],
  'South Indian': ['Masala Dosa', 'Idli Sambhar', 'Medu Vada', 'Uttapam', 'Rava Dosa', 'Onion Dosa', 'Paper Plain Dosa', 'Ghee Roast Dosa', 'Paniyaram', 'Lemon Rice', 'Curd Rice', 'Appam', 'Upma', 'Ven Pongal', 'Bisi Bele Bath', 'Mysore Masala Dosa', 'Set Dosa', 'Rava Idli', 'Kanchipuram Idli', 'Neer Dosa', 'Adai Dosa', 'Pesarattu', 'Vada Curry', 'Tomato Rice', 'Coconut Rice', 'Tamarind Rice', 'Puliyogare', 'Aviyal', 'Olan', 'Kootu Curry', 'Thorun', 'Sambar Rice', 'Vattyappam', 'Kozhukkatta', 'Puttu Kadala'],
  'Chinese': ['Veg Hakka Noodles', 'Veg Manchurian', 'Schezwan Noodles', 'Veg Fried Rice', 'Chili Paneer', 'Honey Chili Potato', 'Veg Spring Rolls', 'Crispy Corn', 'Veg Momos', 'Chowmein Special', 'Gobi Manchurian', 'Mushroom Chili', 'Baby Corn Chili', 'Schezwan Fried Rice', 'Singapuri Noodles', 'American Chopsuey', 'Kimchi Salad', 'Burnt Garlic Rice', 'Manchow Soup', 'Hot and Sour Soup', 'Sweet Corn Soup', 'Darsaan Dessert', 'Paneer 65', 'Veg Crispy', 'Dragon Potato', 'Kung Pao Veg', 'Sizzling Chinese Platter', 'Triple Schezwan Rice', 'Jade Soup', 'Lat Mai Paneer', 'Beijing Style Noodles', 'Mapo Tofu Veg', 'Wontons Special', 'Veg Dimsums', 'Chili Garlic Noodles'],
  'Beverages': ['Cold Coffee', 'Mango Shake', 'Chocolate Shake', 'Sweet Lassi', 'Masala Chai', 'Mojito', 'Lemon Soda', 'Fresh Lime Soda', 'Iced Tea', 'Strawberry Smoothie', 'Vanilla Milkshake', 'Oreo Shake', 'Blue Lagoon', 'Virgin Mary', 'Cold Drink', 'Butter Milk', 'Fruit Punch', 'Badam Milk', 'Thandai', 'Rose Milk', 'Jal Jeera', 'Aam Panna', 'Kokum Sharbat', 'Filter Coffee', 'Green Tea', 'Hot Chocolate', 'Watermelon Juice', 'Orange Juice', 'Pineapple Juice', 'Apple Juice', 'Banana Shake', 'Papaya Shake', 'KitKat Shake', 'Cold Cocoa', 'Cappuccino'],
  'Desserts': ['Gulab Jamun', 'Rasmalai', 'Chocolate Lava Cake', 'Brownie with Ice Cream', 'Kheer', 'Gajar ka Halwa', 'Pastry', 'Cupcake', 'Waffles', 'Kulfi', 'Jalebi', 'Rabri', 'Rasgulla', 'Mysore Pak', 'Barfi', 'Peda', 'Sandesh', 'Mishti Doi', 'Shahi Tukda', 'Phirni', 'Puran Poli', 'Modak', 'Double Ka Meetha', 'Seviyan', 'Apple Pie', 'Cheese Cake', 'Tiramisu', 'Panna Cotta', 'Basundi', 'Imarti', 'Balushahi', 'Ghevar', 'Malpua', 'Payasam', 'Ladoo'],
  'Street Food': ['Pani Puri', 'Samosa Chat', 'Aloo Tikki', 'Pav Bhaji', 'Vada Pav', 'Bhel Puri', 'Dahi Puri', 'Papdi Chat', 'Kachori', 'Dhokla', 'Khandvi', 'Misal Pav', 'Dabeli', 'Mirchi Bajji', 'Bread Pakora', 'Eggless Omelette', 'Sabudana Vada', 'Ragda Pattice', 'Sev Puri', 'Aloo Puri', 'Chana Jor Garam', 'Ram Ladoo', 'Bedmi Poori', 'Ghugni Chaat', 'Basket Chaat', 'Jhal Muri', 'Litti Chokha', 'Poha Jalebi', 'Kulcha Nihari', 'Raj Kachori', 'Dal Pakwan', 'Surti Locho', 'Patra', 'Kothimbir Vadi', 'Methi Na Gota'],
  'Burgers': ['Classic Veg Burger', 'Aloo Tikki Burger', 'Paneer Supreme Burger', 'Cheese Lava Burger', 'Spicy Paneer Burger', 'Double Decker Veg', 'Mushroom Burger', 'Crispy Corn Burger', 'Urban Desi Burger', 'Junior Veg Burger', 'Monster Veg Burger', 'BBQ Veg Burger', 'Tandoori Burger', 'Maharaja Veg Burger', 'Garden Burger', 'Cheese Chiller Burger', 'Salsa Burger', 'Mexican Bean Burger', 'Falafel Burger', 'Quinoa Veg Burger', 'Teriyaki Veg Burger', 'Grilled Halloumi Burger', 'Buffalo Cauliflower Burger', 'Crispy Eggplant Burger', 'Black Bean Burger', 'Sweet Potato Burger', 'Lentil Burger', 'Chickpea Burger', 'Veg Zinger Burger', 'Crunchy Veg Burger', 'Stacker Burger', 'Whopper Veg', 'Tower Burger', 'Supreme Veggie', 'Signature Burger'],
  'Fast Food': ['French Fries', 'Peri Peri Fries', 'Cheese Loaded Fries', 'Veg Nuggets', 'Cheese Corn Nuggets', 'Onion Rings', 'Potato Wedges', 'Garlic Bread', 'Cheese Garlic Bread', 'Veg Strips', 'Corn on the Cob', 'Mashed Potato', 'Coleslaw', 'Popcorn Veg', 'Hash Browns', 'Tater Tots', 'Mozzarella Sticks', 'Jalapeno Poppers', 'Stuffed Mushrooms', 'Veg Fingers', 'Breadsticks', 'Pretzels', 'Nachos with Salsa', 'Loaded Nachos', 'Corn Dogs Veg', 'Quesadilla Veg', 'Burrito Veg', 'Tacos Special', 'Enchiladas', 'Chili Cheese Fries', 'Garlic Knots', 'Mini Corn Dogs', 'Slider Veg', 'Waffle Fries', 'Curly Fries'],
  'Rolls & Wraps': ['Paneer Kathi Roll', 'Veg Seekh Roll', 'Mix Veg Roll', 'Paneer Tikka Wrap', 'Falafel Wrap', 'Mexican Bean Wrap', 'Cheese Corn Roll', 'Schezwan Paneer Roll', 'Aloo Tikki Wrap', 'Mushroom Roll', 'Soya Chaap Roll', 'Chili Paneer Wrap', 'Garden Fresh Wrap', 'Classic Veg Roll', 'Double Paneer Roll', 'Kolkata Kathi Roll', 'Lucknowi Roll', 'Tandoori Wrap', 'BBQ Veg Wrap', 'Spicy Potato Roll', 'Crispy Veg Wrap', 'Lebanese Wrap', 'Greek Veg Wrap', 'Italian Paneer Roll', 'Pesto Veg Wrap', 'Mayo Veg Roll', 'Chipotle Wrap', 'Burrito Wrap', 'Salsa Paneer Roll', 'Veggie Delight Roll', 'Fusion Wrap', 'Spring Roll Wrap', 'Oriental Roll', 'Desi Twist Wrap', 'Specialty Roll'],
  'Sandwiches': ['Grilled Cheese Sandwich', 'Veg Club Sandwich', 'Paneer Tikka Sandwich', 'Bombay Grill Sandwich', 'Corn & Spinach Sandwich', 'Coleslaw Sandwich', 'Aloo Masala Sandwich', 'Cheese Chutney Sandwich', 'Russian Salad Sandwich', 'Italian Sub Sandwich', 'Mushroom Grill Sandwich', 'Gardener Sandwich', 'Mexican Sandwich', 'Tandoori Paneer Sandwich', 'Brown Bread Veg Sandwich', 'Multigrain Sandwich', 'Avocado Toast', 'Caprese Sandwich', 'Pesto Paneer Sandwich', 'Hummus Veg Sandwich', 'Open Face Sandwich', 'Toasted Sandwich', 'Cold Sandwich Special', 'Triple Decker Sandwich', 'Pocket Sandwich', 'Focaccia Sandwich', 'Ciabatta Veg', 'Panini Special', 'Croissant Sandwich', 'Club House Sandwich', 'Feta Veg Sandwich', 'Tofu Sandwich', 'Veg Patty Sandwich', 'Mayo Corn Sandwich', 'Sweet Corn Sandwich'],
  'Pasta': ['Penne Arrabbiata', 'White Sauce Pasta', 'Mixed Sauce Pasta', 'Pesto Pasta', 'Spaghetti Aglio Olio', 'Fusilli with Veggies', 'Macaroni and Cheese', 'Lasagna Veg', 'Ravioli Spinach', 'Tortellini Cheese', 'Fettuccine Alfredo', 'Rigatoni Special', 'Farfalle Salad Pasta', 'Linguine Veg', 'Gnocchi Potato', 'Canneloni Veg', 'Pasta Primavera', 'Mushroom Risotto', 'Vegetable Risotto', 'Tomato Basil Pasta', 'Creamy Mushroom Pasta', 'Baked Pasta', 'Cheese Burst Pasta', 'Indi Pasta Masala', 'Chili Garlic Pasta', 'Schezwan Pasta', 'Tandoori Pasta', 'Paneer Tikka Pasta', 'Olive Oil Veg Pasta', 'Zucchini Noodle Pasta', 'Roasted Veggie Pasta', 'Gorgonzola Pasta', 'Marinara Pasta', 'Amatriciana Veg', 'Bolognese Veg'],
  'Salads': ['Greek Salad', 'Caesar Salad Veg', 'Corn & Sprout Salad', 'Russian Salad', 'Fruit Salad', 'Green Salad', 'Protein Salad', 'Chickpea Salad', 'Pasta Salad', 'Quinoa Salad', 'Garden Salad', 'Couscous Salad', 'Waldorf Salad', 'Coleslaw Special', 'Caprese Salad', 'Tabbouleh Salad', 'Mexican Bean Salad', 'Thai Papaya Salad', 'Watermelon Feta Salad', 'Asian Slaw', 'Cottage Cheese Salad', 'Lentil Salad', 'Sprout Salad', 'Nicoise Salad Veg', 'Beetroot Salad', 'Cucumber Salad', 'Carrot Salad', 'Macaroni Salad', 'Potato Salad', 'Broccoli Salad', 'Spinach Salad', 'Mediterranean Salad', 'Roasted Veg Salad', 'Italian Salad', 'House Special Salad'],
  'Ice Cream': ['Vanilla Scoop', 'Chocolate Scoop', 'Strawberry Scoop', 'Butterscotch Scoop', 'Mango Ice Cream', 'Black Current', 'Choco Chip Ice Cream', 'Fruit and Nut', 'Coffee Ice Cream', 'Kulfi Special', 'Sundae Special', 'Tutti Frutti', 'Roasted Almond', 'Pista Ice Cream', 'Real Mango', 'Belgian Chocolate', 'Brownie Fudge', 'Caramel Swirl', 'Rocky Road', 'Cookie and Cream', 'Mint Chocolate', 'Neapolitan', 'Pralines n Cream', 'Bubblegum Ice Cream', 'Pan Ice Cream', 'Tender Coconut', 'Sitaphal Ice Cream', 'Jackfruit Ice Cream', 'Chiku Ice Cream', 'Anjeer Ice Cream', 'Gulkand Ice Cream', 'Kesar Pista', 'Death by Chocolate', 'American Nuts', 'Swiss Cake Ice Cream'],
};

export async function seedMenuData(db: any, toast?: any) {
  let totalCreated = 0;
  for (const cat of CATEGORIES_DATA) {
    // Generate ~35 items per category to reach 500+ (15 * 35 = 525)
    const templates = DISH_TEMPLATES[cat.name] || Array.from({ length: 35 }, (_, i) => `${cat.name} Special ${i + 1}`);

    for (const name of templates) {
      const q = query(collection(db, 'dishes'), where('name', '==', name));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(collection(db, 'dishes'), {
          name,
          category: cat.name,
          price: 120 + Math.floor(Math.random() * 38) * 10,
          description: `Indulge in our signature ${name}. Prepared with the finest ingredients and traditional recipes to ensure an authentic taste experience.`,
          image: `https://picsum.photos/seed/${name.replace(/\s/g, '-')}/800/600`,
          rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
          isVeg: true,
          createdAt: new Date().toISOString(),
          totalOrders: Math.floor(Math.random() * 500),
          totalRevenue: 0
        });
        totalCreated++;
      }
    }
  }
  if (toast) {
    toast({ title: "Seed Complete", description: `Added ${totalCreated} dishes. Total catalog now exceeds 500+ items.` });
  }
  return totalCreated;
}

export default function AdminDatabasePage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const dishesQuery = useMemoFirebase(() => collection(db, 'dishes'), [db]);
  const { data: dishes } = useCollection(dishesQuery);

  const handleDelete = async (id: string) => {
    if (confirm(`Delete this dish?`)) {
      await deleteDoc(doc(db, 'dishes', id));
      toast({ title: "Deleted", description: "Dish removed successfully." });
    }
  };

  const handleBootstrap = async () => {
    setIsSeeding(true);
    try {
      await seedMenuData(db, toast);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Seed Failed", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddDish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDish = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      image: `https://picsum.photos/seed/${Math.floor(Math.random() * 10000)}/800/600`,
      rating: 4.5,
      isVeg: formData.get('isVeg') === 'on',
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalRevenue: 0
    };
    await addDoc(collection(db, 'dishes'), newDish);
    setIsAddDishOpen(false);
    toast({ title: "Dish Added", description: `${newDish.name} is now live.` });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black mb-2 flex items-center gap-3 text-foreground">
            <Database className="w-10 h-10 text-primary" />
            Mega Repository
          </h1>
          <p className="text-muted-foreground font-medium">Manage and seed your 500+ dish database here.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleBootstrap} 
            disabled={isSeeding}
            className="rounded-xl border-primary text-primary hover:bg-primary/5 font-bold h-11"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
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
                    <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={() => handleDelete(dish.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {dishes?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    Repository is empty. Use the Sync button to seed 500+ items.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
