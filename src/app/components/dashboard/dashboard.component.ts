import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userPosts: Post[] = [];
  totalUsers = 0;
  totalPosts = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      if (user) {
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    if (!this.currentUser) return;

    if (this.currentUser.isAdmin) {
      // Admin can see global stats
      this.userService.getUsers().subscribe({
        next: (users: User[]) => {
          this.totalUsers = users.length;

          // Get all posts to count them
          this.postService.getPosts().subscribe({
            next: (posts: Post[]) => {
              this.totalPosts = posts.length;
              this.userPosts = posts.slice(0, 5); // Just get the latest 5 posts
              this.loading = false;
            },
            error: (err: any) => {
              this.error = 'Failed to load posts';
              this.loading = false;
              console.error('Error loading posts:', err);
            }
          });
        },
        error: (err: any) => {
          this.error = 'Failed to load users';
          this.loading = false;
          console.error('Error loading users:', err);
        }
      });
    } else {
      // Regular user only sees their own posts
      this.postService.getPostsByUserId(this.currentUser.id!).subscribe({
        next: (posts: Post[]) => {
          this.userPosts = posts;
          this.totalPosts = posts.length;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to load posts';
          this.loading = false;
          console.error('Error loading posts:', err);
        }
      });
    }
  }
}
