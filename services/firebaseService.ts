
import { initializeApp, FirebaseApp, deleteApp, getApps } from "firebase/app";
import { getFirestore, collection, setDoc, doc, getDocs, query, orderBy, limit, Firestore, getDoc, deleteDoc } from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;

  setConfig(config: FirebaseConfig) {
    try {
      // Evitar inicializaciones duplicadas
      const existingApps = getApps();
      if (existingApps.length > 0) {
        existingApps.forEach(app => deleteApp(app));
      }

      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      console.log("Bormujos Lab: Sistema Cloud Conectado ->", config.projectId);
      return true;
    } catch (e) {
      console.error("Error al inicializar Firebase:", e);
      return false;
    }
  }

  async saveWorkout(workout: any) {
    if (!this.db) return false;
    try {
      await setDoc(doc(this.db, "workouts", workout.id), {
        ...workout,
        updatedAt: new Date().getTime()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error guardando WOD:", e);
      return false;
    }
  }

  async deleteWorkout(id: string) {
    if (!this.db) return false;
    try {
      await deleteDoc(doc(this.db, "workouts", id));
      return true;
    } catch (e) {
      console.error("Error eliminando WOD:", e);
      return false;
    }
  }

  async getWorkouts() {
    if (!this.db) return [];
    try {
      const q = query(collection(this.db, "workouts"), orderBy("timestamp", "desc"), limit(60));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
      console.error("Error recuperando WODs:", e);
      return [];
    }
  }

  async syncInventory(equipment: any[], benchmarks: any[]) {
    if (!this.db) return false;
    try {
      const gymRef = doc(this.db, "gym", "lab_config");
      await setDoc(gymRef, {
        equipment,
        benchmarks,
        lastUpdate: new Date().getTime()
      });
      return true;
    } catch (e) {
      console.error("Error sincronizando inventario:", e);
      return false;
    }
  }

  async getInventory() {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, "gym", "lab_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (e) {
      console.error("Error obteniendo inventario:", e);
      return null;
    }
  }

  isConfigured(): boolean {
    return this.db !== null;
  }
}

export const firebaseProvider = new FirebaseService();
