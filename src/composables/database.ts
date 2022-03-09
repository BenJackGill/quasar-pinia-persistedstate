/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from 'src/config/firebase';
import {
  deleteDoc,
  updateDoc,
  getDoc,
  DocumentSnapshot,
  doc,
  collection,
  FieldPath,
  OrderByDirection,
  query,
  orderBy,
  getDocs,
  QuerySnapshot,
  DocumentData,
  addDoc,
  DocumentReference,
  FieldValue,
} from 'firebase/firestore';
import { useTask } from 'vue-concurrency';

export const useAddDocTask = () => {
  return useTask(function* (
    signal,
    collectionName: string,
    documentData: object
  ) {
    const col = collection(db, collectionName);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: DocumentReference<object> = yield addDoc(col, documentData);
    return response;
  });
};

export const useGetDocTask = () => {
  return useTask(function* (
    signal,
    collectionName: string,
    documentId: string
  ) {
    const documentReference = doc(db, collectionName, documentId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: DocumentSnapshot = yield getDoc(documentReference);
    const document: Record<string, unknown> = {
      ...response.data(),
      documentId: response.id,
    };
    return document;
  });
};

export const useDeleteDocTask = () => {
  return useTask(function* (
    signal,
    collectionName: string,
    documentId: string
  ) {
    const documentReference = doc(db, collectionName, documentId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: void = yield deleteDoc(documentReference);
    return response;
  });
};

export const useUpdateDocTask = () => {
  return useTask(function* (
    signal,
    collectionName: string,
    documentId: string,
    updates: { [x: string]: FieldValue | Partial<unknown> | undefined }
  ) {
    const documentReference = doc(db, collectionName, documentId);
    const response: void = yield updateDoc(documentReference, updates);
    return response;
  });
};

export const useGetColTask = () => {
  return useTask(function* (
    signal,
    collectionName: string,
    sortedBy: string | FieldPath = '',
    direction: OrderByDirection | undefined = undefined
  ) {
    const colQuery = query(
      collection(db, collectionName),
      orderBy(sortedBy, direction)
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const snapshot: QuerySnapshot<DocumentData> = yield getDocs(colQuery);
    let documents: object[] | undefined;
    snapshot.forEach((doc) => {
      //Ensure the server timestamp has been added
      if (doc.data().createdAt) {
        documents?.push({
          ...doc.data(),
          documentId: doc.id,
        });
      }
    });
    return documents;
  });
};
