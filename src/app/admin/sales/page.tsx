
"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format, subDays, startOfWeek, isSameDay, parseISO, isSameWeek } from 'date-fns';
import { TrendingUp, ShoppingBag, PieChart as PieIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#E55C0A', '#C40A3A', '#FFD700', '#FFA500', '#4CAF50', '#2196F3'];

export default function AdminSalesPage() {
  const db = useFirestore();

  // Fetch Data
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const { data: orders } = useCollection(ordersQuery);

  const foodsQuery = useMemoFirebase(() => collection(db, 'foods'), [db]);
  const { data: foods } = useCollection(foodsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  // Transformation: Daily Sales (Last 14 Days)
  const dailySalesData = useMemo(() => {
    if (!orders) return [];
    return Array.from({ length: 14 }).map((_, i) => {
      const date = subDays(new Date(), 13 - i);
      const label = format(date, 'MMM dd');
      const revenue = orders
        .filter(o => o.orderDate && isSameDay(parseISO(o.orderDate), date))
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      return { name: label, sales: revenue };
    });
  }, [orders]);

  // Transformation: Weekly Revenue (Last 6 Weeks)
  const weeklyRevenueData = useMemo(() => {
    if (!orders) return [];
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subDays(new Date(), (5 - i) * 7);
      const weekStart = startOfWeek(date);
      const label = `Week ${format(weekStart, 'MM/dd')}`;
      const revenue = orders
        .filter(o => o.orderDate && isSameWeek(parseISO(o.orderDate), weekStart))
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      return { name: label, revenue };
    });
  }, [orders]);

  // Transformation: Top Selling Items (By Revenue)
  const topSellingItems = useMemo(() => {
    if (!foods) return [];
    return [...foods]
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 8);
  }, [foods]);

  // Transformation: Category Split
  const categoryData = useMemo(() => {
    if (!categories || !foods) return [];
    return categories.map((cat) => {
      const totalRev = foods
        .filter(f => f.categoryId === cat.id)
        .reduce((acc, f) => acc + (f.totalRevenue || 0), 0);
      return { name: cat.name, value: totalRev };
    }).filter(d => d.value > 0);
  }, [categories, foods]);

  // Transformation: Table Data (Sorted by highest sales/revenue)
  const sortedTableData = useMemo(() => {
    if (!foods) return [];
    return [...foods].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
  }, [foods]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-headline font-black mb-2 flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          Sales Performance
        </h1>
        <p className="text-muted-foreground font-medium">Deep insights into revenue streams and menu popularity.</p>
      </div>

      {/* Top Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Chart */}
        <Card className="border shadow-sm rounded-[2rem] p-8 bg-white overflow-hidden">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline font-black">Daily Sales Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Revenue flow over the last 14 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary opacity-20" />
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.5)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Revenue Chart */}
        <Card className="border shadow-sm rounded-[2rem] p-8 bg-white overflow-hidden">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline font-black">Weekly Revenue</CardTitle>
              <p className="text-xs text-muted-foreground">Consolidated sales by week</p>
            </div>
            <ShoppingBag className="w-5 h-5 text-accent opacity-20" />
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.5)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                   cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                   contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Foods (Horizontal Bar) */}
        <Card className="lg:col-span-2 border shadow-sm rounded-[2rem] p-8 bg-white">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-headline font-black">Top Selling Food Items</CardTitle>
            <p className="text-xs text-muted-foreground">By total revenue contribution</p>
          </CardHeader>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topSellingItems}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted)/0.5)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{fontSize: 11, fontWeight: 800}} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Share Pie Chart */}
        <Card className="border shadow-sm rounded-[2rem] p-8 bg-white flex flex-col">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-headline font-black">Category Sales Split</CardTitle>
            <p className="text-xs text-muted-foreground">Revenue distribution by cuisine</p>
          </CardHeader>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {categoryData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-bold text-muted-foreground uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="font-black text-foreground">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Menu Performance Table */}
      <Card className="border shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline font-black">Menu Catalog Performance</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Detailed breakdown sorted by highest revenue generation.</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">Real-time</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black px-10 h-16 uppercase tracking-widest text-[10px]">Food Item</TableHead>
                <TableHead className="font-black h-16 uppercase tracking-widest text-[10px]">Category</TableHead>
                <TableHead className="font-black h-16 uppercase tracking-widest text-[10px] text-center">Orders Count</TableHead>
                <TableHead className="font-black h-16 uppercase tracking-widest text-[10px] text-right pr-10">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTableData.map((food) => (
                <TableRow key={food.id} className="hover:bg-muted/5 transition-colors border-b last:border-none">
                  <TableCell className="px-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted/20 border overflow-hidden flex-shrink-0">
                        <img src={food.imageURL} alt={food.name} className="object-cover w-full h-full" />
                      </div>
                      <span className="font-black text-foreground">{food.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold border-primary/20 text-primary">
                      {categories?.find(c => c.id === food.categoryId)?.name || 'Misc'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-center text-muted-foreground">{food.totalOrders || 0}</TableCell>
                  <TableCell className="font-black text-right pr-10 text-primary text-lg">
                    ₹{(food.totalRevenue || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {sortedTableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold italic opacity-40">
                    No sales data recorded yet.
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
