import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CategoryData {
  name: string;
  stock: number;
  percentage: number;
  color: string;
}

interface ActivityItem {
  type: 'add' | 'remove' | 'warning';
  title: string;
  description: string;
  time: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'warning' | 'normal';
  imageUrl: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: '' 
})
export class DashboardComponent {
  // Stats data
  totalProducts = 1250;
  lowStock = 23;
  recentEntries = 58;
  todayMovements = 14;

  // Porcentaje de cambios
  totalProductsChange = 4.5;
  lowStockChange = 12;
  todayEntries = 8;
  todayExits = 6;

  // Categorías
  categories: CategoryData[] = [
    { name: 'Electrónicos', stock: 450, percentage: 75, color: 'blue' },
    { name: 'Ropa', stock: 320, percentage: 60, color: 'green' },
    { name: 'Alimentos', stock: 280, percentage: 40, color: 'yellow' },
    { name: 'Hogar', stock: 200, percentage: 30, color: 'indigo' }
  ];

  // Actividad reciente
  recentActivity: ActivityItem[] = [
    {
      type: 'add',
      title: 'Nuevo lote agregado',
      description: '20 unidades de Laptops HP',
      time: 'Hace 2 horas',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      type: 'remove',
      title: 'Salida de productos',
      description: '15 unidades de Camisetas',
      time: 'Hace 4 horas',
      icon: 'M20 12H4',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      type: 'warning',
      title: 'Stock bajo',
      description: 'Producto: Arroz Premium',
      time: 'Hace 5 horas',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  // Productos con stock bajo
  lowStockProducts: ProductItem[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      sku: 'APL-001',
      category: 'Electrónicos',
      currentStock: 3,
      minStock: 10,
      status: 'critical',
      imageUrl: '/api/placeholder/40/40'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      sku: 'SAM-001',
      category: 'Electrónicos',
      currentStock: 5,
      minStock: 15,
      status: 'critical',
      imageUrl: '/api/placeholder/40/40'
    },
    {
      id: '3',
      name: 'Camiseta Nike Dri-FIT',
      sku: 'NIK-001',
      category: 'Ropa',
      currentStock: 8,
      minStock: 20,
      status: 'warning',
      imageUrl: '/api/placeholder/40/40'
    },
    {
      id: '4',
      name: 'Arroz Premium 5kg',
      sku: 'FOD-001',
      category: 'Alimentos',
      currentStock: 12,
      minStock: 30,
      status: 'warning',
      imageUrl: '/api/placeholder/40/40'
    }
  ];

  // Métodos
  updateStock() {
    console.log('Actualizar stock');
  }

  restockProduct(productId: string) {
    console.log('Reabastecer producto:', productId);
  }

  viewAllCategories() {
    console.log('Ver todas las categorías');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  }

  getCategoryColor(color: string): string {
    return `bg-${color}-600`;
  }
}