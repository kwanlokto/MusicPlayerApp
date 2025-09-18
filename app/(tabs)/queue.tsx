import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import TrackPlayer, { Track } from "react-native-track-player";

const QueueScreen = () => {
  const [queue, setQueue] = useState<Track[]>([]);

  // Fetch queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const q = await TrackPlayer.getQueue();
        setQueue(q);
      } catch (err) {
        console.log("Error fetching queue:", err);
      }
    };

    fetchQueue();
  }, []);

  // Optionally, function to jump to a track in the queue
  const handlePlayTrack = async (index: number) => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Queue
      </Text>
      <FlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handlePlayTrack(index)}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.title || "Untitled"}</Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              {item.artist || "Unknown Artist"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default QueueScreen;
