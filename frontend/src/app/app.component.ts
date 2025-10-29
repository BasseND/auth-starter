import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private authSubscription?: Subscription;
  private wasAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Monitor authentication state changes
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      // If user was authenticated but is now not authenticated, redirect to login
      if (this.wasAuthenticated && !isAuthenticated) {
        // Check if we're not already on an auth page
        const currentUrl = this.router.url;
        if (!currentUrl.startsWith('/login') && !currentUrl.startsWith('/register')) {
          this.router.navigate(['/login']);
        }
      }
      this.wasAuthenticated = isAuthenticated;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
