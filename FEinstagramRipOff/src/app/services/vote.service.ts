import {
  HttpClient,
  type HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { type Observable, throwError, map, concatMap } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { Vote } from '../models/vote.model';
import type { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  private apiUrl = 'http://localhost:8080';
  private votesUrl = `${this.apiUrl}/votes`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Vote on a post
   */
  voteOnPost(
    postId: number,
    userId: number,
    voteValue: number
  ): Observable<Vote> {
    const url = `${this.votesUrl}/posts/${postId}/vote`;

    console.log('userId:', userId);
    console.log('voteValue:', voteValue);

    const body = {
      voteValue: voteValue,
      userId: userId
    };

    return this.http
      .post<Vote>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError<Vote>('voteOnPost')));
  }

  /**
   * Toggle vote on a post
   * If the user has already voted with the same value, remove the vote
   * If the user has voted with a different value, remove the old vote and add the new one
   * If the user hasn't voted, add the vote
   */
  toggleVoteOnPost(
    postId: number,
    userId: number,
    voteValue: number,
    currentVote: Vote | null
  ): Observable<Vote | null> {
    // If there's a current vote with the same value, remove it
    if (currentVote && currentVote.vote_type === voteValue) {
      console.log(`Toggling vote: Removing vote ${currentVote.id} for post ${postId}`);
      return this.deleteVote(currentVote.id).pipe(
        tap(() => console.log(`Removed vote for post ${postId}`)),
        catchError(this.handleError<void>('deleteVote')),
        // Return null to indicate vote was removed
        map(() => null)
      );
    }

    // If there's a current vote with a different value, remove the old vote then add the new one
    if (currentVote && currentVote.vote_type !== voteValue) {
        console.log(`Toggling vote: Changing vote ${currentVote.id} for post ${postId} from ${currentVote.vote_type} to ${voteValue}. Deleting old vote first.`);
        // Delete the old vote first
        return this.deleteVote(currentVote.id).pipe(
            tap(() => console.log(`Old vote ${currentVote.id} deleted for post ${postId}. Adding new vote.`)),
            catchError(this.handleError<void>('deleteVote on change')),
            // After deleting, add the new vote
            concatMap(() => this.voteOnPost(postId, userId, voteValue))
        );
    }

    // If no vote exists, add the new vote
    console.log(`Toggling vote: Adding new vote for post ${postId} with value ${voteValue}`);
    return this.voteOnPost(postId, userId, voteValue);
  }

  /**
   * Vote on a comment
   */
  voteOnComment(
    commentId: number,
    userId: number,
    voteValue: number
  ): Observable<Vote> {
    const url = `${this.votesUrl}/comments/${commentId}/vote`;

    const body = {
      user: { id: userId },
      comment: { id: commentId },
      voteValue: voteValue,
    };

    return this.http
      .post<Vote>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError<Vote>('voteOnComment')));
  }

  /**
   * Toggle vote on a comment
   * If the user has already voted with the same value, remove the vote
   * If the user has voted with a different value, remove the old vote and add the new one
   * If the user hasn't voted, add the vote
   */
  toggleVoteOnComment(
    commentId: number,
    userId: number,
    voteValue: number,
    currentVote: Vote | null
  ): Observable<Vote | null> {
    // If there's a current vote with the same value, remove it
    if (currentVote && currentVote.vote_type === voteValue) {
        console.log(`Toggling vote: Removing vote ${currentVote.id} for comment ${commentId}`);
      return this.deleteVote(currentVote.id).pipe(
        tap(() => console.log(`Removed vote for comment ${commentId}`)),
        catchError(this.handleError<void>('deleteVote')),
        // Return null to indicate vote was removed
        map(() => null)
      );
    }

    // If there's a current vote with a different value, remove the old vote then add the new one
     if (currentVote && currentVote.vote_type !== voteValue) {
        console.log(`Toggling vote: Changing vote ${currentVote.id} for comment ${commentId} from ${currentVote.vote_type} to ${voteValue}. Deleting old vote first.`);
        // Delete the old vote first
        return this.deleteVote(currentVote.id).pipe(
            tap(() => console.log(`Old vote ${currentVote.id} deleted for comment ${commentId}. Adding new vote.`)),
            catchError(this.handleError<void>('deleteVote on change')),
            // After deleting, add the new vote
            concatMap(() => this.voteOnComment(commentId, userId, voteValue))
        );
    }

    // If no vote exists, add the new vote
    console.log(`Toggling vote: Adding new vote for comment ${commentId} with value ${voteValue}`);
    return this.voteOnComment(commentId, userId, voteValue);
  }

  /**
   * Get vote count for a post
   */
  getVoteCountForPost(postId: number): Observable<number> {
    const url = `${this.votesUrl}/posts/${postId}/count`;
    return this.http.get<number>(url).pipe(
      tap((count) =>
        console.log(`fetched vote count for post id=${postId}: ${count}`)
      ),
      catchError(this.handleError<number>(`getVoteCountForPost id=${postId}`))
    );
  }

  /**
   * Get vote count for a comment
   */
  getVoteCountForComment(commentId: number): Observable<number> {
    const url = `${this.votesUrl}/comments/${commentId}/count`;
    return this.http.get<number>(url).pipe(
      tap((count) =>
        console.log(`fetched vote count for comment id=${commentId}: ${count}`)
      ),
      catchError(
        this.handleError<number>(`getVoteCountForComment id=${commentId}`)
      )
    );
  }

  /**
   * Get votes by user
   */
  getUserVotes(userId: number): Observable<Vote[]> {
    const url = `${this.votesUrl}/user/${userId}`;
    return this.http.get<Vote[]>(url).pipe(
      tap((_) => console.log(`fetched votes for user id=${userId}`)),
      catchError(this.handleError<Vote[]>(`getUserVotes id=${userId}`))
    );
  }

  /**
   * Delete a vote
   */
  deleteVote(voteId: number): Observable<void> {
    const url = `${this.votesUrl}/${voteId}`;
    return this.http.delete<{message: string}>(url, this.httpOptions).pipe(
      tap((response) => console.log(`deleted vote id=${voteId}: ${response.message}`)),
      map(() => void 0),
      catchError(this.handleError<void>('deleteVote'))
    );
  }

  /**
   * Handle Http operation that failed.
   * @param operation - name of the operation that failed
   */
  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`);

      // Return an error observable with a user-facing error message
      let errorMessage = 'An error occurred';
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // The backend returned an unsuccessful response code
        errorMessage = `Server returned code ${error.status}, error message: ${
          error.error?.message || error.statusText
        }`;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
