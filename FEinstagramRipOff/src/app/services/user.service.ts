import { HttpClient, type HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { type Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import type { User } from "../models/user.model"
import type { Post } from "../models/post.model"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = "http://localhost:8080"
  private usersUrl = `${this.apiUrl}/users`

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  }

  constructor(private http: HttpClient) {}

  /**
   * Get all users from the server
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl).pipe(
      tap((_) => console.log("fetched users")),
      catchError(this.handleError<User[]>("getUsers")),
    )
  }

  /**
   * Get a single user by id
   */
  getUser(id: number): Observable<User> {
    const url = `${this.usersUrl}/${id}`
    return this.http.get<User>(url).pipe(
      tap((_) => console.log(`fetched user id=${id}`)),
      catchError(this.handleError<User>(`getUser id=${id}`)),
    )
  }

  /**
   * Update user details
   */
  updateUser(user: User): Observable<User> {
    const url = `${this.usersUrl}/${user.id}`
    return this.http.put<User>(url, user, this.httpOptions).pipe(
      tap((_) => console.log(`updated user id=${user.id}`)),
      catchError(this.handleError<User>("updateUser")),
    )
  }

  /**
   * Ban or unban a user
   */
  toggleUserBan(userId: number, banned: boolean): Observable<User> {
    const url = `${this.usersUrl}/${userId}/ban`
    return this.http.put<User>(url, { banned }, this.httpOptions).pipe(
      tap((_) => console.log(`${banned ? "banned" : "unbanned"} user id=${userId}`)),
      catchError(this.handleError<User>("toggleUserBan")),
    )
  }

  /**
   * Change user role (admin/user)
   */
  changeUserRole(userId: number, role: string): Observable<User> {
    const url = `${this.usersUrl}/${userId}/role`
    return this.http.put<User>(url, { role }, this.httpOptions).pipe(
      tap((_) => console.log(`changed role for user id=${userId} to ${role}`)),
      catchError(this.handleError<User>("changeUserRole")),
    )
  }

  /**
   * Delete a user
   */
  deleteUser(userId: number): Observable<void> {
    const url = `${this.usersUrl}/${userId}`
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap((_) => console.log(`deleted user id=${userId}`)),
      catchError(this.handleError<void>("deleteUser")),
    )
  }

  /**
   * Get all posts for a specific user
   */
  getUserPosts(userId: number): Observable<Post[]> {
    const url = `${this.usersUrl}/${userId}/posts`
    return this.http.get<Post[]>(url).pipe(
      tap((_) => console.log(`fetched posts for user id=${userId}`)),
      catchError(this.handleError<Post[]>(`getUserPosts id=${userId}`)),
    )
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   */
  private handleError<T>(operation = "operation") {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`)

      // Return an error observable with a user-facing error message
      let errorMessage = "An error occurred"
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred
        errorMessage = `Error: ${error.error.message}`
      } else {
        // The backend returned an unsuccessful response code
        errorMessage = `Server returned code ${error.status}, error message: ${error.error?.message || error.statusText}`
      }

      return throwError(() => new Error(errorMessage))
    }
  }

  getUserPostCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/${userId}/post-count`);
  }

  getUserCommentCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/${userId}/comment-count`);
  }
}
