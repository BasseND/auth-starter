import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/auth.interface';
import { ThemeService } from '../../../shared/services/theme.service';
import { ThemeToggleComponent } from '../../../shared/ui/theme-toggle.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Navigation will be handled by app.component's auth state monitoring
        console.log('Logout successful');
      },
      error: () => {
        // Even if logout fails on server, clear session and let app.component handle navigation
        console.log('Logout completed (with server error)');
      }
    });
  }
}
