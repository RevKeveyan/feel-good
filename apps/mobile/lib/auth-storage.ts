import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CHUNK_SIZE = 1800;

async function secureGet(key: string): Promise<string | null> {
  const chunkCount = await SecureStore.getItemAsync(`${key}.__chunks`);
  if (chunkCount == null) {
    return SecureStore.getItemAsync(key);
  }
  const count = Number(chunkCount);
  if (!Number.isFinite(count) || count <= 0) return null;
  let value = "";
  for (let i = 0; i < count; i += 1) {
    const part = await SecureStore.getItemAsync(`${key}.${i}`);
    if (part == null) return null;
    value += part;
  }
  return value;
}

async function secureSet(key: string, value: string): Promise<void> {
  await secureRemove(key);
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  const chunks = Math.ceil(value.length / CHUNK_SIZE);
  await SecureStore.setItemAsync(`${key}.__chunks`, String(chunks));
  for (let i = 0; i < chunks; i += 1) {
    const start = i * CHUNK_SIZE;
    await SecureStore.setItemAsync(`${key}.${i}`, value.slice(start, start + CHUNK_SIZE));
  }
}

async function secureRemove(key: string): Promise<void> {
  const chunkCount = await SecureStore.getItemAsync(`${key}.__chunks`);
  if (chunkCount != null) {
    const count = Number(chunkCount);
    if (Number.isFinite(count) && count > 0) {
      for (let i = 0; i < count; i += 1) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
    await SecureStore.deleteItemAsync(`${key}.__chunks`);
  }
  await SecureStore.deleteItemAsync(key);
}

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return AsyncStorage.getItem(key);
    }
    const secure = await secureGet(key);
    if (secure != null) return secure;
    const legacy = await AsyncStorage.getItem(key);
    if (legacy != null) {
      await secureSet(key, legacy);
      await AsyncStorage.removeItem(key);
      return legacy;
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await secureSet(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
      return;
    }
    await secureRemove(key);
    await AsyncStorage.removeItem(key);
  },
};
