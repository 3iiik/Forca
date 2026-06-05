declare module 'firebase/app' {
  const app: any;
  export function initializeApp(config: any): any;
  export default app;
}

declare module 'firebase/auth' {
  export function getAuth(app: any): any;
  export function signInAnonymously(auth: any): Promise<{ user: any }>;
}

declare module 'firebase/firestore' {
  export function getFirestore(app: any): any;
  export function doc(db: any, ...path: string[]): any;
  export function setDoc(ref: any, data: any): Promise<void>;
  export function getDoc(ref: any): Promise<{ exists(): boolean; data(): any }>;
}
