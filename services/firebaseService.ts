import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { ItineraryItem } from "../types";

// 1. 定義 Firebase 配置
// 注意：請將下方的字串替換為您實際的 Firebase 專案設定
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2. 初始化 App
const app = initializeApp(firebaseConfig);

// 3. 導出資料庫實例
export const db = getFirestore(app);

// 4. 創建讀取函式
export const fetchItineraryItemsFromDB = async (): Promise<ItineraryItem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "itineraries"));
    const items: ItineraryItem[] = [];
    
    querySnapshot.forEach((doc) => {
      // 將 Firestore 的文件資料轉換為 ItineraryItem 類型
      // 我們使用 doc.id 作為項目的 id，並展開其餘資料
      const data = doc.data() as Omit<ItineraryItem, 'id'>;
      items.push({
        id: doc.id,
        ...data
      });
    });
    
    return items;
  } catch (error) {
    console.error("Error fetching itinerary items from Firebase:", error);
    // 發生錯誤時返回空陣列，避免應用程式崩潰
    return [];
  }
};
