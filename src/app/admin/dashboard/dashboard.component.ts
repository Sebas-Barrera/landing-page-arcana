import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService, UserData } from '../../services/admin-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  allUsers = signal<UserData[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string>('');

  // Estadísticas
  totalUsers = signal<number>(0);
  activeSubscriptions = signal<number>(0);
  arcanaMembers = signal<number>(0);

  // Admin info
  adminEmail = signal<string>('');

  // Exponer Math para usar en el template
  Math = Math;

  // Búsqueda y filtros
  searchTerm = signal<string>('');
  filterStatus = signal<string>('all'); // 'all', 'active', 'none'
  filterArcana = signal<string>('all'); // 'all', 'yes', 'no'

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = 10;

  // Computed: usuarios filtrados y buscados
  filteredUsers = computed(() => {
    let result = this.allUsers();

    // Aplicar búsqueda
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(user =>
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search)
      );
    }

    // Aplicar filtro de estado
    const status = this.filterStatus();
    if (status === 'active') {
      result = result.filter(user => user.subscription_status === 'active');
    } else if (status === 'none') {
      result = result.filter(user => !user.subscription_status);
    }

    // Aplicar filtro de Arcana
    const arcana = this.filterArcana();
    if (arcana === 'yes') {
      result = result.filter(user => user.arcana === true);
    } else if (arcana === 'no') {
      result = result.filter(user => user.arcana === false);
    }

    return result;
  });

  // Computed: total de páginas
  totalPages = computed(() => {
    return Math.ceil(this.filteredUsers().length / this.itemsPerPage);
  });

  // Computed: usuarios de la página actual
  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers().slice(start, end);
  });

  constructor(
    private authService: AdminAuthService,
    private dataService: AdminDataService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.adminEmail.set(this.authService.currentAdminEmail() || '');
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.isLoading.set(true);
      this.error.set('');

      // Cargar usuarios
      const users = await this.dataService.getUsers();
      this.allUsers.set(users);

      // Cargar estadísticas
      const stats = await this.dataService.getUserStats();
      this.totalUsers.set(stats.total);
      this.activeSubscriptions.set(stats.withSubscription);
      this.arcanaMembers.set(stats.arcanaMembers);

      // Resetear a la primera página cuando se recarga
      this.currentPage.set(1);

    } catch (error) {
      console.error('Error loading users:', error);
      this.error.set('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin']);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getSubscriptionBadgeClass(status: string | null): string {
    if (!status) return 'badge-none';
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-active';
      case 'inactive':
      case 'canceled':
        return 'badge-inactive';
      default:
        return 'badge-none';
    }
  }

  // Paginación
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  // Resetear filtros
  clearFilters() {
    this.searchTerm.set('');
    this.filterStatus.set('all');
    this.filterArcana.set('all');
    this.currentPage.set(1);
  }

  // Cuando cambian los filtros, volver a la página 1
  onFilterChange() {
    this.currentPage.set(1);
  }
}
