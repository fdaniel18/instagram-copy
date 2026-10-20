import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import type { User, LoginRequest } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:8080/Instagram";
  private authUrl = `${this.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  login(loginRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/authenticate`, loginRequest, this.httpOptions).pipe(
      tap((response) => {
        console.log("Login response:", response); // Debug output
        if (!response.user || !response.user.id) {
          console.error('Invalid user data in login response:', response);
          throw new Error('Invalid user data received from server');
        }
        localStorage.setItem("token", response.token);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError<any>("authenticate"))
    );
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, user, this.httpOptions).pipe(
      tap((response) => {
        if (!response.user || !response.user.id) {
          console.error('Invalid user data in register response:', response);
          throw new Error('Invalid user data received from server');
        }
        localStorage.setItem("token", response.token);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError<any>("register"))
    );
  }


  logout(): void {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return !!user && user.role === "ADMIN";
  }

  private getUserFromStorage(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      return null;
    }

    try {
      const user = JSON.parse(userJson);
      // Ensure the user object has all required properties
      if (!user || typeof user !== 'object' || !user.id) {
        console.error('Invalid user data in storage:', user);
        localStorage.removeItem("currentUser");
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      localStorage.removeItem("currentUser");
      return null;
    }
  }

  private handleError<T>(operation = "operation") {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`);
      let errorMessage = "An unexpected error occurred"; // Default to a more generic message

      // Check for specific backend errors
      if (error.error?.message === "User is banned!") {
           errorMessage = "Login failed: Your account has been banned.";
      } else if (error.status === 401) { // Unauthorized - invalid credentials
           errorMessage = "Login failed: Invalid username or password.";
      } else if (error.status === 403) { // Forbidden - likely a permission issue other than banned
           errorMessage = "Login failed: You do not have permission.";
      } else if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // The backend returned an unsuccessful response code with potentially a message
        errorMessage = `Server returned code ${error.status}, error message: ${error.error?.message || error.statusText}`;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}