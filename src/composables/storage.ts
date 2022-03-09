import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { store } from 'src/config/firebase';
import { ref, watchEffect } from 'vue';
import { uid } from 'quasar';
import { useUserStore } from 'src/store/user';
import { StorageUpload } from 'src/types';
import { useTask } from 'vue-concurrency';

const userStore = useUserStore();
const user = userStore.user;

type FileType = 'video' | 'image';

const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
const allowedVideoExtensions = [
  '3gp',
  'mp4',
  'mkv',
  'webm',
  'mov',
  'm4v',
  'wmv',
  'avi',
  'avchd',
];

export const useStorageUploadTask = () => {
  return useTask(function* (signal, fileType: FileType, file: File) {
    const downloadURL = new Promise((resolve, reject) => {
      // Exit if wrong file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension) {
        reject(new Error('Missing file extension.'));
      } else if (
        fileType === 'image' &&
        !allowedImageExtensions.includes(fileExtension)
      ) {
        reject(
          new Error(
            'This file is not allowed. Please use .jpeg, .jpg, or .png image files.'
          )
        );
      } else if (
        fileType === 'video' &&
        !allowedVideoExtensions.includes(fileExtension)
      ) {
        reject(
          new Error(
            'This file is not allowed. Please use .3gp, .mp4, .mkv, .webm, .mov, .m4v, .wmv, .avi, or .avchd video files.'
          )
        );
      }

      // Set the storage path
      let storagePath = '';
      if (fileType === 'image') {
        storagePath = `user_images/${user.uid}/${file.name + '_' + uid()}`;
      } else if (fileType === 'video') {
        storagePath = `user_videos/${user.uid}/${file.name + '_' + uid()}`;
      }

      // Upload the file
      const storageReference = storageRef(store, storagePath);
      const uploadTask = uploadBytesResumable(storageReference, file);

      // Listen for state changes, errors, and completion of the upload.
      const unsubscribe = uploadTask.on(
        'state_changed',
        null,
        (error) => {
          reject(error);
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
      // Unsub the listener when the composable is not in use
      watchEffect((onInvalidate) => {
        onInvalidate(() => {
          unsubscribe();
        });
      });
    });
    return downloadURL;
  });
};

export const useStorageUploadStream = (fileType: FileType, file: File) => {
  const storageUpload = ref<StorageUpload>({
    uploadTask: undefined,
    storagePath: undefined,
    downloadURL: undefined,
    uploadProgress: undefined,
    error: undefined,
    isRunning: true,
    isCanceled: false,
    isPaused: false,
    isSuccess: false,
    isError: false,
  });

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (fileExtension) {
    if (
      fileType === 'image' &&
      !allowedImageExtensions.includes(fileExtension)
    ) {
      storageUpload.value.isError = true;
      storageUpload.value.isRunning = false;
      storageUpload.value.error = new Error(
        'This file is not allowed. Please use .jpeg, .jpg, or .png image files.'
      );
      return storageUpload;
    } else if (
      fileType === 'video' &&
      !allowedVideoExtensions.includes(fileExtension)
    ) {
      storageUpload.value.isError = true;
      storageUpload.value.isRunning = false;
      storageUpload.value.error = new Error(
        'This file is not allowed. Please use .3gp, .mp4, .mkv, .webm, .mov, .m4v, .wmv, .avi, or .avchd video files.'
      );
      return storageUpload;
    }
  } else {
    storageUpload.value.isError = true;
    storageUpload.value.isRunning = false;
    storageUpload.value.error = new Error('Missing file extension.');
    return storageUpload;
  }

  // Set the file path
  let storagePath = '';
  if (fileType === 'image') {
    storagePath = `user_images/${user.uid}/${file.name + '_' + uid()}`;
  } else if (fileType === 'video') {
    storagePath = `user_videos/${user.uid}/${file.name + '_' + uid()}`;
  }
  storageUpload.value.storagePath = storagePath;

  // Upload the file
  const storageReference = storageRef(store, storagePath);
  const uploadTask = uploadBytesResumable(storageReference, file);

  //Put uploadTask into the ref
  storageUpload.value.uploadTask = uploadTask;

  // Listen for state changes, errors, and completion of the upload.
  const unsubscribe = uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const uploadProgress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      storageUpload.value.uploadProgress = uploadProgress;
      switch (snapshot.state) {
        case 'canceled':
          storageUpload.value.isCanceled = true;
          storageUpload.value.isRunning = false;
          break;
        case 'paused':
          storageUpload.value.isPaused = true;
          storageUpload.value.isRunning = false;
          break;
        case 'running':
          storageUpload.value.isPaused = false;
          storageUpload.value.isRunning = true;
          break;
      }
    },
    (error) => {
      // Upload error
      storageUpload.value.isError = true;
      storageUpload.value.isRunning = false;
      console.log(error);
      if (error instanceof Error) {
        storageUpload.value.error = error;
      } else {
        throw error;
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadURL) => {
          storageUpload.value.downloadURL = downloadURL;
          storageUpload.value.isSuccess = true;
          storageUpload.value.isRunning = false;
        })
        .catch((error) => {
          // getDownloadURL error
          storageUpload.value.isError = true;
          storageUpload.value.isRunning = false;
          console.log(error);
          if (error instanceof Error) {
            storageUpload.value.error = error;
          } else {
            throw error;
          }
        });
    }
  );
  // Unsub the listener when the composable is not in use
  watchEffect((onInvalidate) => {
    onInvalidate(() => {
      unsubscribe();
    });
  });

  return storageUpload;
};

export const useStorageDeleteTask = () => {
  return useTask(function* (signal, path: string) {
    const storageReference = storageRef(store, path);
    yield deleteObject(storageReference);
  });
};
