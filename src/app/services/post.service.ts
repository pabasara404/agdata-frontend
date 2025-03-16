import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, CreatePostDto, UpdatePostDto } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  // Helper method to create auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Using token for request:', token ? 'yes' : 'no');

    if (!token) {
      return new HttpHeaders();
    }

    // Make sure token doesn't have Bearer prefix already
    const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
    console.log('Token value (first 20 chars):', tokenValue.substring(0, 20));

    return new HttpHeaders({
      'Authorization': `Bearer ${tokenValue}`
    });
  }

  getPosts(): Observable<Post[]> {
    console.log('Getting posts with auth headers');
    const headers = this.getAuthHeaders();
    console.log('Headers set:', headers.has('Authorization'));
    return this.http.get<Post[]>(this.apiUrl, { headers });
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getPostsByUserId(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  createPost(post: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post, { headers: this.getAuthHeaders() });
  }

  updatePost(id: number, post: UpdatePostDto): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post, { headers: this.getAuthHeaders() });
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
