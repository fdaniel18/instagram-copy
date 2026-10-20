import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:8080';
  private commentsUrl = `${this.apiUrl}/comments`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}
  /**
   * Get all comments for a specific post
   */

  getCommentsForPost(postId: number): Observable<Comment[]> {
    const url = `${this.apiUrl}/posts/${postId}/comments`;
    return this.http.get<Comment[]>(url, this.httpOptions).pipe(
      tap(() => console.log(`Fetched comments for post id=${postId}`)),
      catchError(this.handleError<Comment[]>('getCommentsForPost'))
    );
  }
  /**
   * Create a new comment
   */

  createComment(
    postId: number,
    comment: Partial<Comment>
  ): Observable<Comment> {
    const url = `${this.commentsUrl}/posts/${postId}`;
    return this.http.post<Comment>(url, comment, this.httpOptions).pipe(
      tap((newComment) =>
        console.log(
          `Added comment with id=${newComment.id} to post id=${postId}`
        )
      ),
      catchError(this.handleError<Comment>('createComment'))
    );
  }
  /**
   * Update a comment
   */

  updateComment(
    commentId: number,
    comment: Partial<Comment>
  ): Observable<Comment> {
    const url = `${this.commentsUrl}/${commentId}`;
    return this.http.put<Comment>(url, comment, this.httpOptions).pipe(
      tap((updatedComment) =>
        console.log(`Updated comment with id=${updatedComment.id}`)
      ),
      catchError(this.handleError<Comment>('updateComment'))
    );
  }
  /**
   * Delete a comment (optional)
   */

  deleteComment(commentId: number): Observable<void> {
    const url = `${this.commentsUrl}/${commentId}`;
    return this.http.delete<void>(url, { ...this.httpOptions, responseType: 'text' as 'json' }).pipe(
      tap(() => console.log(`Deleted comment id=${commentId}`)),
      catchError(this.handleError<void>('deleteComment'))
    );
  }
  /**
   * Generic error handler
   */

  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`);

      let errorMessage = 'An error occurred';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client error: ${error.error.message}`;
      } else {
        errorMessage = `Server error: ${error.status}, ${
          error.error?.message || error.statusText
        }`;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
