export interface NotificationPreferences {
  emailEnabled: boolean;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  isAdmin: boolean;
  notificationPreferences?: NotificationPreferences;
}

export interface CreateUserDto {
  username: string;
  email: string;
  notificationPreferences?: NotificationPreferences;
}

export interface UpdateUserDto {
  email: string;
  notificationPreferences?: NotificationPreferences;
}

export interface SetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}
