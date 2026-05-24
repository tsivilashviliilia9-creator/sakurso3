import { Routes } from '@angular/router';

import { PageNotFound } from './core/page-not-found/page-not-found';
import { Home } from './core/home/home';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },

  {
    path: 'home',
    component: Home,
  },

  {
    path: 'about',
    loadComponent: () => import('./core/about/about').then((m) => m.About),
    title: 'Project - About',
  },

  {
    path: 'contact',
    loadComponent: () => import('./core/contact/contact').then((m) => m.Contact),
    title: 'Project - Contact',
    canActivate: [authGuard],
  },

  {
    path: 'log-in',
    loadComponent: () => import('./core/log-in/log-in').then((m) => m.LogIn),
    title: 'Project - Login',
  },

  {
    path: 'register',
    loadComponent: () => import('./core/registration/registration').then((m) => m.Registration),
    title: 'Project - Register',
  },

  {
    path: 'booking',
    loadComponent: () => import('./core/booking/booking').then((m) => m.Booking),
    title: 'Project - Booking',
    canActivate: [authGuard],
  },

  {
    path: 'cart',
    loadComponent: () => import('./core/cart/cart').then((m) => m.Cart),
    title: 'Project - My Bookings',
    canActivate: [authGuard],
  },

  { path: '**', component: PageNotFound },
];