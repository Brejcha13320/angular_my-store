import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { Category } from '../../../models/category.model';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  activeMenu: boolean = false;
  counter: number = 0;
  profile: User | null = null;
  categories: Category[] = [];

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storeService.myCart$.subscribe((products) => {
      this.counter = products.length;
    });
    this.getCategories();
    this.authService.user$.subscribe((data) => {
      this.profile = data;
    });
  }

  toggleMenu() {
    this.activeMenu = !this.activeMenu;
  }

  login() {
    this.authService
      .loginAndGet('admin@mail.com', 'admin123')
      .subscribe((user) => {
        this.router.navigate(['/profile']);
      });
  }

  getCategories() {
    this.categoriesService.getCategories().subscribe((categories: any[]) => {
      this.categories = categories;
      console.log(this.categories);
    });
  }

  logOut() {
    this.authService.logOut();
    this.profile = null;
    this.router.navigate(['home']);
  }

  createUser() {
    this.usersService
      .create({
        name: 'Jesus',
        email: 'jesus@mail.com',
        password: '12345',
        role: 'customer',
      })
      .subscribe((rta) => {
        console.log(rta);
      });
  }
}
