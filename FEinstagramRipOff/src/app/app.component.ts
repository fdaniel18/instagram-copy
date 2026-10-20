import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { filter, map, tap } from 'rxjs/operators';
import { LoadingComponent } from './components/loading/loading.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class AppComponent implements OnInit {
  isLoading = true; // Start with loading true
  // isLoginPage: boolean = true; // Keep or remove based on actual usage

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    // Check auth status and set isLoading accordingly
    this.authService.currentUser.pipe(
      tap(user => {
        // Once we know the auth state, we can hide the initial loading screen
        this.isLoading = false;
      })
    ).subscribe();

    // Keep existing logic for potential future use or other loading indicators
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      // map(() => this.route.snapshot.queryParams['loading'])
    ).subscribe(() => {
      // Additional logic based on navigation can go here if needed
      // For now, the main loading is controlled by authService
    });

     // Optional: Re-enable login page check if needed
    // this.router.events.subscribe(() => {
    //   this.isLoginPage = this.router.url === '/login';
    // });
  }

  // navigateToSignup() { // Keep or remove based on actual usage
  //   this.router.navigate(['/signup']);
  // }
}
