import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  ButtonComponent, 
  InputComponent, 
  TextareaComponent,
  CardComponent, 
  AlertComponent, 
  SpinnerComponent,
  ModalComponent,
  ModalService,
  PaginationComponent,
  BreadcrumbComponent,
  AccordionComponent
} from '../../shared/ui';

@Component({
  selector: 'app-ui-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    CardComponent,
    AlertComponent,
    SpinnerComponent,
    ModalComponent,
    PaginationComponent,
    BreadcrumbComponent,
    AccordionComponent
  ],
  templateUrl: './ui-demo.component.html',
})
export class UiDemoComponent {
  demoForm: FormGroup;
  modalForm: FormGroup;
  
  // Modal states
  isSimpleModalOpen = false;
  isFormModalOpen = false;
  isConfirmModalOpen = false;
  isNoCloseModalOpen = false;
  
  // Modal configuration
  modalTitle = '';
  modalSubtitle = '';
  modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  modalPosition: 'center' | 'top' = 'center';

  // Pagination properties
  currentPage = 1;
  totalPages = 10;
  currentPageWithInfo = 3;
  totalPagesWithInfo = 15;
  totalItems = 150;
  itemsPerPage = 10;
  currentPageCompact = 2;
  totalPagesCompact = 5;

  // Breadcrumb properties
  breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Produits', url: '/products' },
    { label: 'Électronique', url: '/products/electronics' },
    { label: 'Smartphones' }
  ];

  breadcrumbItemsWithHome = [
    { label: 'Produits', url: '/products' },
    { label: 'Catégories', url: '/products/categories' },
    { label: 'Ordinateurs' }
  ];

  breadcrumbItemsLong = [
    { label: 'Accueil', url: '/' },
    { label: 'Administration', url: '/admin' },
    { label: 'Gestion des utilisateurs', url: '/admin/users' },
    { label: 'Profils', url: '/admin/users/profiles' },
    { label: 'Permissions', url: '/admin/users/profiles/permissions' },
    { label: 'Détails' }
  ];

  // Accordion properties
  accordionItems = [
    {
      id: '1',
      title: 'Qu\'est-ce que Angular ?',
      content: 'Angular est un framework de développement d\'applications web développé par Google. Il utilise TypeScript et suit une architecture basée sur les composants.',
      expanded: false
    },
    {
      id: '2',
      title: 'Avantages d\'Angular',
      content: 'Angular offre une structure robuste, un système de dépendances puissant, des outils de développement excellents, et une grande communauté de développeurs.',
      expanded: false
    },
    {
      id: '3',
      title: 'Comment commencer ?',
      content: 'Pour commencer avec Angular, installez Node.js, puis Angular CLI avec npm install -g @angular/cli. Créez ensuite un nouveau projet avec ng new mon-projet.',
      expanded: false
    }
  ];

  accordionItemsMultiple = [
    {
      id: 'multi-1',
      title: 'Configuration du projet',
      content: 'Configurez votre environnement de développement avec les outils nécessaires : Node.js, npm, Angular CLI, et votre éditeur de code préféré.',
      expanded: true
    },
    {
      id: 'multi-2',
      title: 'Structure des composants',
      content: 'Organisez vos composants de manière logique avec une hiérarchie claire. Utilisez des modules pour grouper les fonctionnalités connexes.',
      expanded: false
    },
    {
      id: 'multi-3',
      title: 'Services et injection de dépendances',
      content: 'Créez des services pour partager la logique métier entre les composants. Utilisez l\'injection de dépendances d\'Angular pour une architecture modulaire.',
      expanded: true
    }
  ];

  accordionItemsCompact = [
    {
      id: 'compact-1',
      title: 'Installation',
      content: 'npm install @angular/core',
      expanded: false
    },
    {
      id: 'compact-2',
      title: 'Configuration',
      content: 'Configurez angular.json',
      expanded: false
    },
    {
      id: 'compact-3',
      title: 'Démarrage',
      content: 'ng serve --open',
      expanded: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      phone: [''],
    });
    
    this.modalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  getPasswordError(): string {
    const passwordControl = this.demoForm.get('password');
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        return 'Le mot de passe est requis';
      }
      if (passwordControl.errors?.['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    return '';
  }
  
  // Modal methods
  openModal(size: 'sm' | 'md' | 'lg' | 'xl', position: 'center' | 'top' = 'center') {
    this.modalSize = size;
    this.modalPosition = position;
    this.modalTitle = `Modal ${size.toUpperCase()}`;
    this.modalSubtitle = `Position: ${position}`;
    this.isSimpleModalOpen = true;
  }
  
  closeSimpleModal() {
    this.isSimpleModalOpen = false;
  }
  
  openFormModal() {
    this.modalForm.reset();
    this.isFormModalOpen = true;
  }
  
  closeFormModal() {
    this.isFormModalOpen = false;
  }
  
  submitModalForm() {
    if (this.modalForm.valid) {
      console.log('Form submitted:', this.modalForm.value);
      this.closeFormModal();
    }
  }
  
  openConfirmModal() {
    this.isConfirmModalOpen = true;
  }
  
  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }
  
  confirmAction() {
    console.log('Action confirmed');
    this.closeConfirmModal();
  }
  
  openNoCloseModal() {
    this.isNoCloseModalOpen = true;
  }
  
  closeNoCloseModal() {
    this.isNoCloseModalOpen = false;
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }

  onPageChangeWithInfo(page: number) {
    this.currentPageWithInfo = page;
    console.log('Page with info changed to:', page);
  }

  onPageChangeCompact(page: number) {
    this.currentPageCompact = page;
    console.log('Compact page changed to:', page);
  }

  // Breadcrumb methods
  onBreadcrumbClick(item: any) {
    console.log('Breadcrumb item clicked:', item);
    if (item.url) {
      // Navigation logic here
      console.log('Navigate to:', item.url);
    }
  }

  // Accordion methods
  onAccordionToggle(event: any) {
    console.log('Accordion item toggled:', event);
  }

  onAccordionExpanded(event: any) {
    console.log('Accordion item expanded:', event);
  }

  onAccordionCollapsed(event: any) {
    console.log('Accordion item collapsed:', event);
  }
}