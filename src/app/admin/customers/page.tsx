
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function CustomerInsightsPage() {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: users } = useCollection(usersQuery);

  const customerData = users?.map(user => ({
    name: user.displayName || 'Anonymous',
    orders: user.totalOrders || 0,
    spent: user.totalMoneySpent || 0,
    email: user.email,
    id: user.id
  })).sort((a, b) => b.spent - a.spent) || [];

  const chartData = customerData.slice(0, 10);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-headline font-black mb-2">Customer Insights</h1>
        <p className="text-muted-foreground">Monitor loyal customers and their spending habits.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-headline font-bold">Most Active Customers (By Spending)</CardTitle>
        </CardHeader>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.5)', radius: 8 }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b">
          <CardTitle className="text-xl font-headline font-bold">Customer Loyalty Table</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold p-6">Customer</TableHead>
              <TableHead className="font-bold">Customer ID</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Total Orders</TableHead>
              <TableHead className="font-bold">Total Spending</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {customerData.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="p-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-muted">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="font-bold">{user.orders}</TableCell>
                <TableCell className="font-bold text-primary">₹{user.spent.toLocaleString()}</TableCell>
                <TableCell>
                  {user.orders >= 20 ? (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 rounded-full px-3 py-1 font-bold">Gold Customer</Badge>
                  ) : user.orders >= 10 ? (
                    <Badge className="bg-slate-400 hover:bg-slate-500 rounded-full px-3 py-1 font-bold">Silver Customer</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full">Regular</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
