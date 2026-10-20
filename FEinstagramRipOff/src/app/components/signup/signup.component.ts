import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; //  import AuthService

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService //  inject AuthService
  ) {
    this.signupForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: ['', Validators.required], // Adaugam phone number care nu era
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      const newUser = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        phoneNumber: formValue.phoneNumber
      };

      this.authService.register(newUser).subscribe({
        next: (response) => {
          console.log("User registered:", response);
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          console.error("Registration error:", error);
        }
      });
    } else {
      console.log('Formular invalid!');
    }
  }


  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}