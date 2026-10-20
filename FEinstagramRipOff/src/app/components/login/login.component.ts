import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService //  injectăm serviciul de autentificare
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.loginError = '';
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Formular validat!', credentials);

      this.authService.login(credentials).subscribe({
        next: (res) => {
          console.log('Autentificare reușită:', res);
          this.router.navigate(['/posts']); //  navigare doar dacă login-ul reușește
        },
        error: (err) => {
          console.error('Eroare la autentificare:', err.message);
          this.loginError = err.message;
        }
      });
    } else {
      console.log('Formular invalid!');
    }
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}