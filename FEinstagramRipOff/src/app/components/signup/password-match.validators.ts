import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validator personalizat pentru validarea parolelor
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // Returnează eroare dacă parolele nu se potrivesc
    return password === confirmPassword ? null : { mismatch: true };
  };
}
