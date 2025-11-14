import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContentManagerService,
  ContentLibraryItem,
  ContentLibraryCreate
} from '../../../services/content-manager.service';

@Component({
  selector: 'app-content-library-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-library-tab.component.html',
  styleUrl: './content-library-tab.component.scss'
})
export class ContentLibraryTabComponent implements OnInit {
  // State
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<ContentLibraryItem[]>([]);
  readonly filteredItems = signal<ContentLibraryItem[]>([]);
  readonly jsonKeys = signal<string[]>([]);

  // Filters
  readonly sections = signal<string[]>([]);
  readonly categories = signal<string[]>([]);
  readonly selectedSection = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly searchTerm = signal<string>('');

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = 10;
  readonly totalPages = signal<number>(1);
  readonly paginatedItems = signal<ContentLibraryItem[]>([]);

  // Modal states
  readonly showCreateEditModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly editingItem = signal<ContentLibraryItem | null>(null);
  readonly deletingItemId = signal<number | null>(null);

  // Form data
  readonly formData = signal<ContentLibraryCreate>({
    data: {},
    category: '',
    section: '',
    order: null,
    tag: null
  });
  readonly existingTags = signal<string[]>([]);  // Tags que ya existían
  readonly newTagInput = signal<string>('');     // Input para nuevas tags
  readonly formError = signal<string | null>(null);

  // Dynamic JSON fields
  readonly jsonFields = signal<Array<{key: string, value: string, isNew: boolean}>>([]);

  constructor(private contentService: ContentManagerService) {}

  async ngOnInit() {
    await this.loadSections();
    await this.loadData();
  }

  /**
   * Carga las secciones disponibles
   */
  async loadSections() {
    try {
      const sections = await this.contentService.getContentLibrarySections();
      this.sections.set(sections);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  }

  /**
   * Carga las categorías según la sección seleccionada
   */
  async loadCategories() {
    try {
      const section = this.selectedSection() || undefined;
      const categories = await this.contentService.getContentLibraryCategories(section);
      this.categories.set(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Carga los datos con filtros aplicados
   */
  async loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const section = this.selectedSection() || undefined;
      const category = this.selectedCategory() || undefined;

      const data = await this.contentService.getContentLibrary(section, category);
      this.items.set(data);

      // Extraer keys del JSON
      if (section || category) {
        const keys = await this.contentService.extractJsonKeys(section, category);
        this.jsonKeys.set(keys);
      } else {
        this.jsonKeys.set([]);
      }

      this.applyFilters();
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar los datos');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Aplica filtros de búsqueda y actualiza paginación
   */
  applyFilters() {
    let filtered = [...this.items()];

    // Filtro de búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(item =>
        item.section.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.id.toString().includes(search) ||
        (item.tag && item.tag.some(t => t.toLowerCase().includes(search))) ||
        JSON.stringify(item.data).toLowerCase().includes(search)
      );
    }

    this.filteredItems.set(filtered);
    this.updatePagination();
  }

  /**
   * Actualiza la paginación
   */
  updatePagination() {
    const total = Math.ceil(this.filteredItems().length / this.itemsPerPage);
    this.totalPages.set(total || 1);

    // Ajustar página actual si está fuera de rango
    if (this.currentPage() > total && total > 0) {
      this.currentPage.set(total);
    }

    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedItems.set(this.filteredItems().slice(start, end));
  }

  /**
   * Cambia de página
   */
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePagination();
    }
  }

  /**
   * Maneja el cambio de sección
   */
  async onSectionChange() {
    this.selectedCategory.set('');
    await this.loadCategories();
    await this.loadData();
  }

  /**
   * Maneja el cambio de categoría
   */
  async onCategoryChange() {
    await this.loadData();
  }

  /**
   * Limpia los filtros
   */
  async clearFilters() {
    this.selectedSection.set('');
    this.selectedCategory.set('');
    this.searchTerm.set('');
    this.categories.set([]);
    this.currentPage.set(1);
    await this.loadData();
  }

  /**
   * Abre el modal para crear
   */
  openCreateModal() {
    this.editingItem.set(null);
    this.formData.set({
      data: {},
      category: this.selectedCategory() || '',
      section: this.selectedSection() || '',
      order: null,
      tag: null
    });
    this.existingTags.set([]);  // No hay tags existentes al crear
    this.newTagInput.set('');
    this.formError.set(null);

    // Inicializar con un campo vacío (nuevo campo editable)
    this.jsonFields.set([{ key: '', value: '', isNew: true }]);

    this.showCreateEditModal.set(true);
  }

  /**
   * Abre el modal para editar
   */
  openEditModal(item: ContentLibraryItem) {
    this.editingItem.set(item);
    this.formData.set({
      data: item.data || {},
      category: item.category,
      section: item.section,
      order: item.order,
      tag: item.tag
    });
    this.existingTags.set(item.tag || []);  // Tags existentes bloqueadas
    this.newTagInput.set('');
    this.formError.set(null);

    // Convertir el JSON en campos editables (campos existentes no son nuevos)
    const fields = Object.entries(item.data || {}).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      isNew: false  // Los campos existentes no son editables en su key
    }));

    // Si no hay campos, inicializar con uno vacío editable
    this.jsonFields.set(fields.length > 0 ? fields : [{ key: '', value: '', isNew: true }]);

    this.showCreateEditModal.set(true);
  }

  /**
   * Cierra el modal de crear/editar
   */
  closeCreateEditModal() {
    this.showCreateEditModal.set(false);
    this.editingItem.set(null);
    this.formError.set(null);
  }

  /**
   * Guarda (crea o actualiza) un item
   */
  async saveItem() {
    this.formError.set(null);

    // Validaciones
    if (!this.formData().section || !this.formData().category) {
      this.formError.set('Section y Category son requeridos');
      return;
    }

    // Validar que al menos haya un campo con key y value
    const validFields = this.jsonFields().filter(f => f.key.trim() && f.value.trim());
    if (validFields.length === 0) {
      this.formError.set('Debes agregar al menos un campo de datos');
      return;
    }

    // Construir el objeto JSON desde los campos
    const jsonData: Record<string, any> = {};
    for (const field of validFields) {
      const key = field.key.trim();
      let value: any = field.value.trim();

      // Intentar parsear como JSON si parece ser un objeto o array
      if ((value.startsWith('{') && value.endsWith('}')) ||
          (value.startsWith('[') && value.endsWith(']'))) {
        try {
          value = JSON.parse(value);
        } catch {
          // Si falla, mantener como string
        }
      } else if (value === 'true' || value === 'false') {
        // Convertir booleanos
        value = value === 'true';
      } else if (!isNaN(Number(value)) && value !== '') {
        // Convertir números
        value = Number(value);
      }

      jsonData[key] = value;
    }

    this.formData.update(data => ({ ...data, data: jsonData }));

    // Combinar tags existentes con nuevas tags
    const newTags = this.newTagInput().trim()
      ? this.newTagInput().split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const allTags = [...this.existingTags(), ...newTags];

    this.formData.update(data => ({
      ...data,
      tag: allTags.length > 0 ? allTags : null
    }));

    try {
      this.isLoading.set(true);

      if (this.editingItem()) {
        // Actualizar
        await this.contentService.updateContentLibrary(
          this.editingItem()!.id,
          this.formData()
        );
      } else {
        // Crear
        await this.contentService.createContentLibrary(this.formData());
      }

      this.closeCreateEditModal();
      await this.loadData();
    } catch (err: any) {
      this.formError.set(err.message || 'Error al guardar');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Abre el modal de confirmación de eliminación
   */
  openDeleteModal(id: number) {
    this.deletingItemId.set(id);
    this.showDeleteModal.set(true);
  }

  /**
   * Cierra el modal de eliminación
   */
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deletingItemId.set(null);
  }

  /**
   * Confirma y ejecuta la eliminación
   */
  async confirmDelete() {
    const id = this.deletingItemId();
    if (!id) return;

    try {
      this.isLoading.set(true);
      await this.contentService.deleteContentLibrary(id);
      this.closeDeleteModal();
      await this.loadData();
    } catch (err: any) {
      this.error.set(err.message || 'Error al eliminar');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtiene el valor de una key del JSON
   */
  getJsonValue(item: ContentLibraryItem, key: string): string {
    if (!item.data || typeof item.data !== 'object') return '-';
    const value = item.data[key];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Genera el rango de páginas para mostrar
   */
  getPageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];

    // Mostrar máximo 5 páginas
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }

  /**
   * Actualiza el campo section del formData
   */
  updateFormSection(value: string) {
    this.formData.update(data => ({ ...data, section: value }));
  }

  /**
   * Actualiza el campo category del formData
   */
  updateFormCategory(value: string) {
    this.formData.update(data => ({ ...data, category: value }));
  }

  /**
   * Actualiza el campo order del formData
   */
  updateFormOrder(value: number | null) {
    this.formData.update(data => ({ ...data, order: value }));
  }

  /**
   * Agrega un nuevo campo vacío a jsonFields
   */
  addField() {
    this.jsonFields.update(fields => [...fields, { key: '', value: '', isNew: true }]);
  }

  /**
   * Elimina un campo de jsonFields por índice
   */
  removeField(index: number) {
    this.jsonFields.update(fields => fields.filter((_, i) => i !== index));
  }

  /**
   * Elimina una tag existente
   */
  removeExistingTag(tag: string) {
    this.existingTags.update(tags => tags.filter(t => t !== tag));
  }

  /**
   * Maneja el cambio de section en el modal
   */
  async onModalSectionChange(section: string) {
    this.updateFormSection(section);
    // Limpiar category cuando cambia section
    this.updateFormCategory('');
    // Recargar categories
    await this.loadCategories();
  }
}
