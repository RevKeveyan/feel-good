import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { alertMediaPermissionNeeded } from "@/lib/media-permissions";
import { cacheBustUrl, formatUploadError, uploadLocalImage } from "@/lib/upload-image";
import { VisionAddTile } from "@/components/onboarding";
import { Body, IconLabel, Kicker } from "@/components/ui";
import { Lock, Trash2 } from "@/components/ui/icons";
import {
  borders,
  colors,
  iconSizes,
  radius,
  space,
  visionRingColors,
} from "@/src/theme";

type VisionItem = { id: string; storage_path: string; url: string };

const VISION_LIMIT = 8;
const VISION_GAP = 12;
const SIGNED_URL_TTL = 3600;
const BUCKET = "vision-board";

type Props = {
  userId: string | null;
  contentWidth: number;
};

export function VisionBoardGrid({ userId, contentWidth }: Props) {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const tileWidth = Math.floor((contentWidth - VISION_GAP) / 2);

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("vision_board_items")
      .select("id, storage_path")
      .eq("user_id", uid)
      .order("sort_order", { ascending: true });
    if (!data?.length) {
      setItems([]);
      return;
    }
    const next: VisionItem[] = [];
    for (const row of data) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL);
      if (signed?.signedUrl) {
        next.push({
          id: row.id,
          storage_path: row.storage_path,
          url: cacheBustUrl(signed.signedUrl) ?? signed.signedUrl,
        });
      }
    }
    setItems(next);
  }, []);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    void load(userId);
  }, [userId, load]);

  async function pickLibraryAsset() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alertMediaPermissionNeeded("Photo library access is required for your vision board.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets[0]) return null;
    return { uri: result.assets[0].uri };
  }

  async function addItem() {
    if (!userId || uploading) return;
    if (items.length >= VISION_LIMIT) {
      Alert.alert("Limit reached", `You can add up to ${VISION_LIMIT} vision board images.`);
      return;
    }
    const asset = await pickLibraryAsset();
    if (!asset) return;
    const path = `${userId}/${Date.now()}.jpg`;
    setUploading(true);
    try {
      await uploadLocalImage({
        bucket: BUCKET,
        path,
        uri: asset.uri,
        contentType: "image/jpeg",
      });
      const { error } = await supabase
        .from("vision_board_items")
        .insert({ user_id: userId, storage_path: path, sort_order: items.length });
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw new Error(error.message || "Could not save vision board item");
      }
      await load(userId);
    } catch (e) {
      Alert.alert("Upload failed", formatUploadError(e));
    } finally {
      setUploading(false);
    }
  }

  async function replaceItem(item: VisionItem) {
    if (!userId || uploading) return;
    const asset = await pickLibraryAsset();
    if (!asset) return;
    const path = `${userId}/${Date.now()}.jpg`;
    setUploading(true);
    try {
      await uploadLocalImage({
        bucket: BUCKET,
        path,
        uri: asset.uri,
        contentType: "image/jpeg",
      });
      const { error } = await supabase
        .from("vision_board_items")
        .update({ storage_path: path })
        .eq("id", item.id)
        .eq("user_id", userId);
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw new Error(error.message || "Could not update vision board item");
      }
      if (item.storage_path !== path) {
        await supabase.storage.from(BUCKET).remove([item.storage_path]);
      }
      await load(userId);
    } catch (e) {
      Alert.alert("Replace failed", formatUploadError(e));
    } finally {
      setUploading(false);
    }
  }

  async function removeItem(item: VisionItem) {
    if (!userId) return;
    const { error } = await supabase
      .from("vision_board_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);
    if (error) {
      Alert.alert("Delete failed", error.message || "Could not remove vision board item");
      return;
    }
    await supabase.storage.from(BUCKET).remove([item.storage_path]);
    setItems((prev) => prev.filter((v) => v.id !== item.id));
  }

  return (
    <View>
      <View style={styles.grid}>
        {items.map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.cell,
              {
                width: tileWidth,
                height: tileWidth,
                borderColor: visionRingColors[i % visionRingColors.length],
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              disabled={uploading}
              onPress={() => void replaceItem(item)}
            >
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
            </Pressable>
            <Pressable style={styles.remove} onPress={() => void removeItem(item)}>
              <Trash2 size={iconSizes.sm} color={colors.white} strokeWidth={2} />
            </Pressable>
          </View>
        ))}
        {items.length < VISION_LIMIT && (
          <VisionAddTile
            onPress={() => void addItem()}
            uploading={uploading}
            tileWidth={tileWidth}
          />
        )}
      </View>
      <Kicker style={styles.counter}>
        {items.length} of {VISION_LIMIT}
      </Kicker>
      <IconLabel
        style={styles.lockNote}
        gap={space.sm}
        icon={<Lock size={iconSizes.xs} color={colors.mutedForeground} strokeWidth={2} />}
      >
        <Body size="sm">Only you can see these. Tap a photo to replace it.</Body>
      </IconLabel>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: VISION_GAP,
    marginBottom: space.lg,
  },
  cell: {
    alignSelf: "flex-start",
    position: "relative",
    borderRadius: radius["2xl"],
    borderWidth: borders.thick,
    overflow: "hidden",
    backgroundColor: colors.muted,
  },
  image: { width: "100%", height: "100%" },
  remove: {
    position: "absolute",
    top: space.sm,
    right: space.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.scrim,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: { marginBottom: space.sm },
  lockNote: { marginTop: space.lg },
});
