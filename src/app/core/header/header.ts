import { Component, signal, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isMenuOpen = signal(false);
  isLoggedIn = signal(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    this.isLoggedIn.set(!!localStorage.getItem('access_token'));
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedIn.set(false);
    this.router.navigateByUrl('/log-in');
  }

  toggleMenu(): void {
    this.isMenuOpen.update((x) => !x);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}