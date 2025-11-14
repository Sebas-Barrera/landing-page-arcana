import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentLibraryTabComponent } from './content-library-tab/content-library-tab.component';
import { RichContentTabComponent } from './rich-content-tab/rich-content-tab.component';

type TabType = 'content_library' | 'rich_content';

@Component({
  selector: 'app-content-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ContentLibraryTabComponent,
    RichContentTabComponent
  ],
  templateUrl: './content-manager.component.html',
  styleUrl: './content-manager.component.scss'
})
export class ContentManagerComponent {
  readonly activeTab = signal<TabType>('content_library');

  /**
   * Cambia la tab activa
   */
  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
  }
}
