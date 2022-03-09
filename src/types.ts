import { RecaptchaVerifier } from 'firebase/auth';
import { UploadTask } from 'firebase/storage';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
  }
}

export interface User {
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  profilePhotoURL?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  uid: string;
}

export interface StorageUpload {
  uploadTask?: UploadTask;
  storagePath?: string;
  uploadProgress?: number;
  downloadURL?: string;
  error?: Error;
  isCanceled: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isSuccess: boolean;
  isError: boolean;
}
