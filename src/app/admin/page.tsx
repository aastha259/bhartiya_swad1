
"use client"

import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ChefHat,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const SALES_DATA = [
  { name: 'Jan', sales: 400 },
  { name: 'Feb', sales: 300 },
  { name: 'Mar', sales: 200 },
  { name: 'Apr', sales: 278 },
  { name: 'May', sales: 189 },
  { name: 'Jun', sales: 239 },
];

export default function AdminDashboardOverview() {
  const db = useFirestore();
  const { user } = useUser();

  // Real-time data fetching for stats - Defer until user is logged in
  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'orders');
  }, [db, user]);
  const { data: orders } = useCollection(ordersQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users');
  }, [db, user]);
  const { data: users } = useCollection(usersQuery);

  const foodsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'foods');
  }, [db, user]);
  const { data: foods } = useCollection(foodsQuery);

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders?.filter(order => order.orderDate?.startsWith(today)).length || 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary', trend: '+12.5%', isUp: true },
    { label: 'Total Orders', value: orders?.length || 0, icon: ShoppingBag, color: 'text-blue-500', trend: '+8.2%', isUp: true },
    { label: 'Total Customers', value: users?.length || 0, icon: Users, color: 'text-green-500', trend: '+5.4%', isUp: true },
    { label: 'Today\'s Orders', value: todayOrders, icon: ChefHat, color: 'text-accent', trend: '-2.1%', isUp: false },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-headline font-black mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Super Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-4 rounded-2xl bg-muted group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full",
                  stat.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-headline font-bold">Weekly Revenue Trend</CardTitle>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-headline font-bold">Monthly Sales Graph</CardTitle>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)', radius: 8 }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
