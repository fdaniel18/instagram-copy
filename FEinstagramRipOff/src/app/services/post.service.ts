import {
  HttpClient,
  type HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { Post } from '../models/post.model';
import type { Comment } from '../models/comment.model';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:8080';
  private postsUrl = `${this.apiUrl}/posts`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get all posts from the server
   */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.postsUrl).pipe(
      tap((_) => console.log('fetched posts')),
      catchError(this.handleError<Post[]>('getPosts'))
    );
  }

  /**
   * Get a single post by id
   */
  getPost(id: number): Observable<Post> {
    const url = `${this.postsUrl}/${id}`;
    return this.http.get<Post>(url).pipe(
      tap((_) => console.log(`fetched post id=${id}`)),
      catchError(this.handleError<Post>(`getPost id=${id}`))
    );
  }

  /**
   * Get a detailed post view with all comments
   */
  getPostDetail(id: number): Observable<Post> {
    const url = `${this.postsUrl}/${id}/detail`;
    return this.http.get<Post>(url).pipe(
      tap((_) => console.log(`fetched detailed post id=${id}`)),
      catchError(this.handleError<Post>(`getPostDetail id=${id}`))
    );
  }

  /**
   * Create a new post
   */
  createPost(post: Post): Observable<Post> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<Post>(this.postsUrl, post, { headers }).pipe(
      tap((newPost: Post) => console.log(`added post w/ id=${newPost.id}`)),
      catchError(this.handleError<Post>('createPost'))
    );
  }

  /**
   * Update an existing post
   */
  updatePost(post: Post): Observable<Post> {
    const url = `${this.postsUrl}/${post.id}`;
    const token = localStorage.getItem('token');
    
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<Post>(url, post, { headers }).pipe(
      tap((_) => console.log(`updated post id=${post.id}`)),
      catchError(this.handleError<Post>('updatePost'))
    );
  }

  /**
   * Delete a post
   */
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.postsUrl}/${id}`, { observe: 'response' })
      .pipe(
        map(response => {
          if (response.status === 200) {
            return;
          }
          throw new Error('Failed to delete post');
        })
      );
  }

  /**
   * Get comments for a specific post
   */
  getPostComments(postId: number): Observable<Comment[]> {
    const url = `${this.postsUrl}/${postId}/comments`;
    return this.http.get<Comment[]>(url).pipe(
      tap((_) => console.log(`fetched comments for post id=${postId}`)),
      catchError(this.handleError<Comment[]>(`getPostComments id=${postId}`))
    );
  }

  /**
   * Get posts by username
   */
  getPostsByUser(username: string): Observable<Post[]> {
    const url = `${this.postsUrl}/filterByUser`;
    const params = { username: username };
    return this.http.get<Post[]>(url, { params: params }).pipe(
      tap((_) => console.log(`fetched posts for user=${username}`)),
      catchError(this.handleError<Post[]>(`getPostsByUser username=${username}`))
    );
  }

  /**
   * Toggle comments for a post
   */
  togglePostComments(postId: number, stopComments: boolean): Observable<Post> {
    const url = `${this.postsUrl}/${postId}/comments`;
    return this.http.put<Post>(url, { stopComments }).pipe(
      tap((_) => console.log(`toggled comments for post id=${postId}`)),
      catchError(this.handleError<Post>('togglePostComments'))
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(error.message || 'Something went wrong'));
    };
  }
}
