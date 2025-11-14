import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface ContentLibraryItem {
  id: number;
  data: Record<string, any>;
  created_at: string;
  category: string;
  section: string;
  order: number | null;
  tag: string[] | null;
}

export interface RichContentItem {
  id: number;
  html: string;
  plain_text: string | null;
  section: string;
  category: string;
  tag: string[] | null;
  created_at: string;
}

export interface ContentLibraryCreate {
  data: Record<string, any>;
  category: string;
  section: string;
  order?: number | null;
  tag?: string[] | null;
}

export interface RichContentCreate {
  html: string;
  plain_text?: string | null;
  section: string;
  category: string;
  tag?: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {
  private supabase: SupabaseClient | null = null;

  constructor() {}

  /**
   * Inicializa el cliente de Supabase (lazy initialization)
   */
  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.key
      );
    }
    return this.supabase;
  }

  // ==================== CONTENT LIBRARY METHODS ====================

  /**
   * Obtiene todos los registros de content_library con filtros opcionales
   */
  async getContentLibrary(section?: string, category?: string): Promise<ContentLibraryItem[]> {
    try {
      const client = this.getSupabaseClient();
      let query = client
        .from('content_library')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching content library:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getContentLibrary:', error);
      throw error;
    }
  }

  /**
   * Obtiene un registro específico de content_library por ID
   */
  async getContentLibraryById(id: number): Promise<ContentLibraryItem | null> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('content_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching content library item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getContentLibraryById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo registro en content_library
   */
  async createContentLibrary(item: ContentLibraryCreate): Promise<ContentLibraryItem> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('content_library')
        .insert([item])
        .select()
        .single();

      if (error) {
        console.error('Error creating content library item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createContentLibrary:', error);
      throw error;
    }
  }

  /**
   * Actualiza un registro existente de content_library
   */
  async updateContentLibrary(id: number, item: Partial<ContentLibraryCreate>): Promise<ContentLibraryItem> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('content_library')
        .update(item)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating content library item:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No se encontró el registro para actualizar');
      }

      return data;
    } catch (error) {
      console.error('Error in updateContentLibrary:', error);
      throw error;
    }
  }

  /**
   * Elimina un registro de content_library
   */
  async deleteContentLibrary(id: number): Promise<void> {
    try {
      const client = this.getSupabaseClient();
      const { error } = await client
        .from('content_library')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content library item:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteContentLibrary:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las secciones únicas de content_library
   */
  async getContentLibrarySections(): Promise<string[]> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('content_library')
        .select('section');

      if (error) {
        console.error('Error fetching sections:', error);
        throw error;
      }

      // Extraer valores únicos
      const uniqueSections = [...new Set((data || []).map(item => item.section))].filter(Boolean);
      return uniqueSections.sort();
    } catch (error) {
      console.error('Error in getContentLibrarySections:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías únicas de content_library, opcionalmente filtradas por sección
   */
  async getContentLibraryCategories(section?: string): Promise<string[]> {
    try {
      const client = this.getSupabaseClient();
      let query = client.from('content_library').select('category');

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Extraer valores únicos
      const uniqueCategories = [...new Set((data || []).map(item => item.category))].filter(Boolean);
      return uniqueCategories.sort();
    } catch (error) {
      console.error('Error in getContentLibraryCategories:', error);
      throw error;
    }
  }

  /**
   * Extrae todas las keys únicas del campo JSON data para una section/category específica
   */
  async extractJsonKeys(section?: string, category?: string): Promise<string[]> {
    try {
      const items = await this.getContentLibrary(section, category);
      const allKeys = new Set<string>();

      items.forEach(item => {
        if (item.data && typeof item.data === 'object') {
          Object.keys(item.data).forEach(key => allKeys.add(key));
        }
      });

      return Array.from(allKeys).sort();
    } catch (error) {
      console.error('Error in extractJsonKeys:', error);
      throw error;
    }
  }

  // ==================== RICH CONTENT METHODS ====================

  /**
   * Obtiene todos los registros de rich_content con filtros opcionales
   */
  async getRichContent(section?: string, category?: string): Promise<RichContentItem[]> {
    try {
      const client = this.getSupabaseClient();
      let query = client
        .from('rich_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching rich content:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRichContent:', error);
      throw error;
    }
  }

  /**
   * Obtiene un registro específico de rich_content por ID
   */
  async getRichContentById(id: number): Promise<RichContentItem | null> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('rich_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching rich content item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getRichContentById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo registro en rich_content
   */
  async createRichContent(item: RichContentCreate): Promise<RichContentItem> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('rich_content')
        .insert([item])
        .select()
        .single();

      if (error) {
        console.error('Error creating rich content item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createRichContent:', error);
      throw error;
    }
  }

  /**
   * Actualiza un registro existente de rich_content
   */
  async updateRichContent(id: number, item: Partial<RichContentCreate>): Promise<RichContentItem> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('rich_content')
        .update(item)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating rich content item:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No se encontró el registro para actualizar');
      }

      return data;
    } catch (error) {
      console.error('Error in updateRichContent:', error);
      throw error;
    }
  }

  /**
   * Elimina un registro de rich_content
   */
  async deleteRichContent(id: number): Promise<void> {
    try {
      const client = this.getSupabaseClient();
      const { error } = await client
        .from('rich_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting rich content item:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteRichContent:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las secciones únicas de rich_content
   */
  async getRichContentSections(): Promise<string[]> {
    try {
      const client = this.getSupabaseClient();
      const { data, error } = await client
        .from('rich_content')
        .select('section');

      if (error) {
        console.error('Error fetching sections:', error);
        throw error;
      }

      // Extraer valores únicos
      const uniqueSections = [...new Set((data || []).map(item => item.section))].filter(Boolean);
      return uniqueSections.sort();
    } catch (error) {
      console.error('Error in getRichContentSections:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías únicas de rich_content, opcionalmente filtradas por sección
   */
  async getRichContentCategories(section?: string): Promise<string[]> {
    try {
      const client = this.getSupabaseClient();
      let query = client.from('rich_content').select('category');

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Extraer valores únicos
      const uniqueCategories = [...new Set((data || []).map(item => item.category))].filter(Boolean);
      return uniqueCategories.sort();
    } catch (error) {
      console.error('Error in getRichContentCategories:', error);
      throw error;
    }
  }
}
