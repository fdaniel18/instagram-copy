import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { VoteService } from '../../services/vote.service';
import type { Comment } from '../../models/comment.model';
import { DatePipe as AngularDatePipe } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  imports: [CommonModule, FormsModule],
  providers: [AngularDatePipe],
})
export class CommentComponent implements OnInit {
  @Input() postId!: number;
  @Input() userId!: number;

  comments: Comment[] = [];
  newCommentText: string = '';

  ngOnInit(): void {
    this.loadComments();
  }

  constructor(
    private commentService: CommentService,
    private voteService: VoteService
  ) {}

  loadComments() {
    this.commentService.getCommentsForPost(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments.map((c) => ({
          ...c,
          voteCount: c.votes.reduce((sum, vote) => sum + vote.voteValue, 0),
          currentUserVote:
            c.votes.find((v) => v.user && v.user.id === this.userId)
              ?.voteValue ?? 0,
        })); // Sortare după scorul voturilor

        this.comments.sort(
          (a, b) => (b as any).voteCount - (a as any).voteCount
        );
      },
      error: (err) => console.error('Eroare la încărcarea comentariilor:', err),
    });
  }

  addComment() {
    const text = this.newCommentText.trim();
    if (!text) return;

    const newComment = {
      text: text,
      picture_url: 'https://www.example.com/profile.jpg', // hardcoded temporar
      user: { id: this.userId } as any,
      dateTime: new Date(),
    };

    this.commentService.createComment(this.postId, newComment).subscribe({
      next: () => {
        this.newCommentText = '';
        this.loadComments(); // Reîncarcă lista
      },
      error: (err) => console.error('Eroare la adăugarea comentariului:', err),
    });
  }

  voteComment(comment: Comment, value: number) {
    // Nu lăsa userul să voteze propriul comentariu
    if (comment.user.id === this.userId) return; // Dacă deja a votat cu aceeași valoare, ignorăm

    if ((comment as any).currentUserVote === value) return;

    this.voteService.voteOnComment(comment.id, this.userId, value).subscribe({
      next: () => {
        this.loadComments(); // Actualizează voturile și ordinea
      },
      error: (err) => console.error('Eroare la vot:', err),
    });
  }

  get commentsSorted(): Comment[] {
    return [...this.comments].sort(
      (a, b) => (b as any).voteCount - (a as any).voteCount
    );
  }
}
