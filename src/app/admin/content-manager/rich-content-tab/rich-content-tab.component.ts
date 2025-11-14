import { Component, OnInit, signal, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContentManagerService,
  RichContentItem,
  RichContentCreate
} from '../../../services/content-manager.service';

@Component({
  selector: 'app-rich-content-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rich-content-tab.component.html',
  styleUrl: './rich-content-tab.component.scss'
})
export class RichContentTabComponent implements OnInit {
  @ViewChild('quillEditor') quillEditorRef?: ElementRef;

  private quillInstance: any = null;
  private isBrowser: boolean;

  // State
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<RichContentItem[]>([]);
  readonly filteredItems = signal<RichContentItem[]>([]);

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
  readonly paginatedItems = signal<RichContentItem[]>([]);

  // Modal states
  readonly showCreateEditModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly showPreviewModal = signal<boolean>(false);
  readonly editingItem = signal<RichContentItem | null>(null);
  readonly deletingItemId = signal<number | null>(null);
  readonly previewContent = signal<string>('');

  // Form data
  readonly formData = signal<RichContentCreate>({
    html: '',
    plain_text: '',
    section: '',
    category: '',
    tag: null
  });
  readonly existingTags = signal<string[]>([]);  // Tags que ya existían
  readonly newTagInput = signal<string>('');     // Input para nuevas tags
  readonly formError = signal<string | null>(null);

  constructor(
    private contentService: ContentManagerService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    await this.loadSections();
    await this.loadData();
  }

  /**
   * Inicializa el editor Quill
   */
  async initQuillEditor() {
    if (!this.isBrowser || !this.quillEditorRef) return;

    try {
      // Importación dinámica de Quill solo en el navegador
      const Quill = (await import('quill')).default;

      const editorElement = this.quillEditorRef.nativeElement;

      this.quillInstance = new Quill(editorElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
        },
        placeholder: 'Escribe el contenido HTML aquí...'
      });

      // Sincronizar cambios con formData
      this.quillInstance.on('text-change', () => {
        if (this.quillInstance) {
          const html = this.quillInstance.root.innerHTML;
          const plainText = this.quillInstance.getText().trim();

          // Actualizar correctamente el Signal
          this.formData.update(data => ({
            ...data,
            html: html,
            plain_text: plainText
          }));
        }
      });

      // Cargar contenido inicial si existe
      if (this.editingItem()) {
        this.quillInstance.root.innerHTML = this.editingItem()!.html;
      }
    } catch (error) {
      console.error('Error initializing Quill:', error);
    }
  }

  /**
   * Destruye el editor Quill
   */
  destroyQuillEditor() {
    if (this.quillInstance) {
      this.quillInstance = null;
    }
  }

  /**
   * Carga las secciones disponibles
   */
  async loadSections() {
    try {
      const sections = await this.contentService.getRichContentSections();
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
      const categories = await this.contentService.getRichContentCategories(section);
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

      const data = await this.contentService.getRichContent(section, category);
      this.items.set(data);

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
        item.html.toLowerCase().includes(search) ||
        (item.plain_text && item.plain_text.toLowerCase().includes(search))
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
      html: '',
      plain_text: '',
      category: this.selectedCategory() || '',
      section: this.selectedSection() || '',
      tag: null
    });
    this.existingTags.set([]);  // No hay tags existentes al crear
    this.newTagInput.set('');
    this.formError.set(null);
    this.showCreateEditModal.set(true);

    // Inicializar Quill después de que el modal se renderice
    setTimeout(() => this.initQuillEditor(), 100);
  }

  /**
   * Abre el modal para editar
   */
  openEditModal(item: RichContentItem) {
    this.editingItem.set(item);
    this.formData.set({
      html: item.html,
      plain_text: item.plain_text || '',
      category: item.category,
      section: item.section,
      tag: item.tag
    });
    this.existingTags.set(item.tag || []);  // Tags existentes bloqueadas
    this.newTagInput.set('');
    this.formError.set(null);
    this.showCreateEditModal.set(true);

    // Inicializar Quill después de que el modal se renderice
    setTimeout(() => this.initQuillEditor(), 100);
  }

  /**
   * Cierra el modal de crear/editar
   */
  closeCreateEditModal() {
    this.showCreateEditModal.set(false);
    this.editingItem.set(null);
    this.formError.set(null);
    this.destroyQuillEditor();
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

    if (!this.formData().html || this.formData().html.trim() === '<p><br></p>') {
      this.formError.set('El contenido HTML no puede estar vacío');
      return;
    }

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
        await this.contentService.updateRichContent(
          this.editingItem()!.id,
          this.formData()
        );
      } else {
        // Crear
        await this.contentService.createRichContent(this.formData());
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
   * Abre el modal de preview
   */
  openPreviewModal(html: string) {
    this.previewContent.set(html);
    this.showPreviewModal.set(true);
  }

  /**
   * Cierra el modal de preview
   */
  closePreviewModal() {
    this.showPreviewModal.set(false);
    this.previewContent.set('');
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
      await this.contentService.deleteRichContent(id);
      this.closeDeleteModal();
      await this.loadData();
    } catch (err: any) {
      this.error.set(err.message || 'Error al eliminar');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Trunca el HTML para vista previa
   */
  truncateHtml(html: string, maxLength: number = 100): string {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Genera el rango de páginas para mostrar
   */
  getPageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];

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
   * Actualiza el campo plain_text del formData
   */
  updateFormPlainText(value: string) {
    this.formData.update(data => ({ ...data, plain_text: value }));
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
