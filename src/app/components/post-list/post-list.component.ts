import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { CreatePostComponent } from '../create-post/create-post.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CreatePostComponent],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;

  constructor(
    private postService: PostService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    this.postService.getPosts().subscribe({
      next: (data: Post[]) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load posts. Please try again.';
        this.loading = false;
        console.error('Error loading posts:', err);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  onPostCreated(post: Post): void {
    this.posts.unshift(post); // Add new post to the beginning
    this.showCreateForm = false;
  }

  canEditPost(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // User can edit if they're an admin or the post author
    return currentUser.isAdmin || post.userId === currentUser.id;
  }

  deletePost(id: number | undefined): void {
    if (!id) {
      this.error = 'Invalid post ID';
      return;
    }

    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.id !== id);
        },
        error: (err: any) => {
          this.error = 'Failed to delete post. Please try again.';
          console.error('Error deleting post:', err);
        }
      });
    }
  }
}
