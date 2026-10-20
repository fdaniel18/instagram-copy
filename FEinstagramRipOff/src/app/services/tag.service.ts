import {  HttpClient, type HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { type Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import type { Tag } from "../models/tag.model"

@Injectable({
  providedIn: "root",
})
export class TagService {
  private apiUrl = "http://localhost:8080" // Update with your Spring Boot API URL
  private tagsUrl = `${this.apiUrl}/tags`

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  }

  constructor(private http: HttpClient) {}

  /**
   * Get all tags
   */
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.tagsUrl).pipe(
      tap((_) => console.log("fetched tags")),
      catchError(this.handleError<Tag[]>("getTags")),
    )
  }

  /**
   * Get a single tag by id
   */
  getTag(id: number): Observable<Tag> {
    const url = `${this.tagsUrl}/${id}`
    return this.http.get<Tag>(url).pipe(
      tap((_) => console.log(`fetched tag id=${id}`)),
      catchError(this.handleError<Tag>(`getTag id=${id}`)),
    )
  }

  /**
   * Create a new tag
   */
  createTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(this.tagsUrl, tag, this.httpOptions).pipe(
      tap((newTag: Tag) => console.log(`added tag w/ id=${newTag.id}`)),
      catchError(this.handleError<Tag>("createTag")),
    )
  }

  /**
   * Update an existing tag
   */
  updateTag(tag: Tag): Observable<Tag> {
    const url = `${this.tagsUrl}/${tag.id}`
    return this.http.put<Tag>(url, tag, this.httpOptions).pipe(
      tap((_) => console.log(`updated tag id=${tag.id}`)),
      catchError(this.handleError<Tag>("updateTag")),
    )
  }

  /**
   * Delete a tag
   */
  deleteTag(tagId: number): Observable<void> {
    const url = `${this.tagsUrl}/${tagId}`
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap((_) => console.log(`deleted tag id=${tagId}`)),
      catchError(this.handleError<void>("deleteTag")),
    )
  }

  /**
   * Get posts by tag
   */
  getPostsByTag(tagId: number): Observable<any[]> {
    const url = `${this.tagsUrl}/${tagId}/posts`
    return this.http.get<any[]>(url).pipe(
      tap((_) => console.log(`fetched posts for tag id=${tagId}`)),
      catchError(this.handleError<any[]>(`getPostsByTag id=${tagId}`)),
    )
  }

  /**
   * Handle Http operation that failed.
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
}
