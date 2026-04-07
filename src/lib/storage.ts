import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

export async function uploadFile(file: File): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    return "";
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `uploads/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  await uploadBytes(storageRef, uint8Array, {
    contentType: file.type,
  });

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export function getPlaceholderUrl(): string {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+VGh1bWJuYWlsPC90ZXh0Pjwvc3ZnPg==";
}
