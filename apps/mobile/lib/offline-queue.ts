import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const QUEUE_KEY = "fgs-offline-queue-v1";

export type QueuedUpsert = {
  table: "daily_entries";
  payload: Record<string, unknown>;
};

export async function enqueueUpsert(payload: Record<string, unknown>) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue: QueuedUpsert[] = raw ? JSON.parse(raw) : [];
  queue.push({ table: "daily_entries", payload });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function flushOfflineQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return;
  const queue: QueuedUpsert[] = JSON.parse(raw);
  const remaining: QueuedUpsert[] = [];
  for (const item of queue) {
    const { error } = await supabase.from(item.table).upsert(item.payload, {
      onConflict: "user_id,entry_date",
    });
    if (error) remaining.push(item);
  }
  if (remaining.length === 0) {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } else {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  }
}
