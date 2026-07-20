'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockInventory } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState(mockInventory);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter((item) => item.quantity < item.reorderLevel);

  const handleDelete = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  const getTotalValue = () => {
    return inventory.reduce((sum, item) => sum + item.quantity * item.cost, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-2">Track medical supplies and equipment</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${getTotalValue()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
              </div>
              {lowStockItems.length > 0 && (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Low Stock Alert</p>
          <p className="text-red-700 text-sm mt-1">
            {lowStockItems.length} item(s) need reordering:
          </p>
          <ul className="text-red-700 text-sm mt-2 space-y-1">
            {lowStockItems.map((item) => (
              <li key={item.id}>
                • {item.name} ({item.quantity}/{item.reorderLevel} {item.unit})
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Item Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Reorder Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Unit Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{item.category}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{item.reorderLevel}</td>
                      <td className="py-3 px-4 text-gray-900">${item.cost}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            item.quantity < item.reorderLevel
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {item.quantity < item.reorderLevel ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/inventory/${item.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
