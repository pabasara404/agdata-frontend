import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  @Output() postCreated = new EventEmitter<Post>();
  @Output() cancelled = new EventEmitter<void>();

  postForm!: FormGroup;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    this.postService.createPost(this.postForm.value).subscribe({
      next: (post: Post) => {
        this.submitting = false;
        this.postCreated.emit(post);
        this.postForm.reset();
      },
      error: (err: any) => {
        this.submitting = false;
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Failed to create post. Please try again.';
        }
        console.error('Error creating post:', err);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
