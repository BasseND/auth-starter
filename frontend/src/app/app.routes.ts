import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { EmailVerificationComponent } from './components/auth/email-verification/email-verification.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UiDemoComponent } from './components/ui-demo/ui-demo.component';

export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Guest routes (login/register) - only accessible when not authenticated
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'auth/email-verification',
    component: EmailVerificationComponent
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent
  },
  
  // Protected routes - require authentication
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'ui-demo',
        component: UiDemoComponent
      }
    ]
  },
  
  // Wildcard route - redirect to dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
