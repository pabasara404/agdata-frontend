export interface Post {
  id?: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}
