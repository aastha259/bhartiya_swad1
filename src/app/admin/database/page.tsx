
"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, Trash2, Plus, Search, Database } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

export default function DatabaseManagementPage() {
  const db = useFirestore();
  const [search, setSearch] = useState('');

  const foodsQuery = useMemoFirebase(() => collection(db, 'foods'), [db]);
  const { data: foods } = useCollection(foodsQuery);

  const restaurantsQuery = useMemoFirebase(() => collection(db, 'restaurants'), [db]);
  const { data: restaurants } = useCollection(restaurantsQuery);

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: users } = useCollection(usersQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const { data: orders } = useCollection(ordersQuery);

  const handleDelete = async (collName: string, id: string) => {
    if (confirm(`Are you sure you want to delete this item from ${collName}?`)) {
      await deleteDoc(doc(db, collName, id));
    }
  };

  const handleUpdatePrice = async (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      await updateDoc(doc(db, 'foods', id), { price });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black mb-2 flex items-center gap-3">
            <Database className="w-10 h-10 text-primary" />
            Database Management
          </h1>
          <p className="text-muted-foreground">Monitor and update all main Firestore collections.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            className="pl-10 h-11 bg-white rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="foods" className="w-full">
        <TabsList className="bg-white border p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="foods" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Foods</TabsTrigger>
          <TabsTrigger value="restaurants" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Restaurants</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Orders</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="foods">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold p-6">Food Name</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Price (₹)</TableHead>
                  <TableHead className="font-bold">Trending</TableHead>
                  <TableHead className="font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {foods?.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map((food) => (
                  <TableRow key={food.id}>
                    <TableCell className="p-6 font-bold">{food.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full">
                        {categories?.find(c => c.id === food.categoryId)?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={food.price} 
                        className="w-24 h-9 font-bold text-primary"
                        onBlur={(e) => handleUpdatePrice(food.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {food.trending ? <Badge className="bg-accent rounded-full">Trending</Badge> : <Badge variant="outline" className="rounded-full">Standard</Badge>}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-primary"><Edit3 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-destructive" onClick={() => handleDelete('foods', food.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold p-6">Restaurant</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                  <TableHead className="font-bold">Phone</TableHead>
                  <TableHead className="font-bold">Revenue</TableHead>
                  <TableHead className="font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {restaurants?.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="p-6 font-bold">{res.name}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{res.address}</TableCell>
                    <TableCell>{res.phone}</TableCell>
                    <TableCell className="font-bold text-green-600">₹{(res.totalRevenue || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-primary"><Edit3 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-destructive" onClick={() => handleDelete('restaurants', res.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold p-6">Display Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Orders</TableHead>
                  <TableHead className="font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {users?.filter(u => u.email.toLowerCase().includes(search.toLowerCase())).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="p-6 font-bold">{user.displayName || 'Guest'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full", user.role === 'admin' ? "bg-accent" : "bg-primary")}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">{user.totalOrders || 0}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-lg hover:text-destructive" onClick={() => handleDelete('users', user.id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold p-6">Order ID</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {orders?.filter(o => o.id.toLowerCase().includes(search.toLowerCase())).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="p-6 font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold text-primary">₹{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-lg hover:text-destructive" onClick={() => handleDelete('orders', order.id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold p-6">Category Name</TableHead>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {categories?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="p-6 font-bold">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-primary"><Edit3 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:text-destructive" onClick={() => handleDelete('categories', cat.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-6 border-t flex justify-center">
              <Button variant="outline" className="rounded-xl border-dashed border-2 px-12 h-14 font-bold text-muted-foreground hover:text-primary hover:border-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add New Category
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
