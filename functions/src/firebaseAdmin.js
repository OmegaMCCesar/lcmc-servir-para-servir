import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore"; // 1. Importar esto

if (!admin.apps.length) {
  admin.initializeApp();
}

// 2. Modificar la exportación para especificar el nombre 'lcmc'
export const getDb = () => getFirestore("lcmc");