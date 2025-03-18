import { useState, useEffect } from "react";
import { db } from "../config/firebaseConfig";
import { collection, getDocs, updateDoc, doc, increment } from "firebase/firestore";

interface Tag {
  id: string;
  name: string;
  count: number;
  createdAt: number;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tags from Firestore
  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, "tags"));
      const tagList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          name: data.name || "",
          count: data.count || 0,
          createdAt: data.createdAt || Date.now()
        };
      }) as Tag[];
      
      // Sort tags alphabetically
      tagList.sort((a, b) => a.name.localeCompare(b.name));
      setTags(tagList);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  // Increment usage count for a tag
  const incrementTagUsage = async (tagId: string) => {
    try {
      await updateDoc(doc(db, "tags", tagId), {
        count: increment(1)
      });
    } catch (err) {
      console.error("Error incrementing tag usage:", err);
    }
  };

  // Decrement usage count for a tag
  const decrementTagUsage = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag || tag.count <= 0) return;
    
    try {
      await updateDoc(doc(db, "tags", tagId), {
        count: increment(-1)
      });
    } catch (err) {
      console.error("Error decrementing tag usage:", err);
    }
  };

  // Update tag usage counts in batch
  const updateTagUsageCounts = async (addTagIds: string[], removeTagIds: string[]) => {
    try {
      // Increment all added tags
      for (const tagId of addTagIds) {
        await incrementTagUsage(tagId);
      }
      
      // Decrement all removed tags
      for (const tagId of removeTagIds) {
        await decrementTagUsage(tagId);
      }
      
      // Refresh tags to get updated counts
      fetchTags();
    } catch (err) {
      console.error("Error updating tag usage counts:", err);
    }
  };

  // Load tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    fetchTags,
    incrementTagUsage,
    decrementTagUsage,
    updateTagUsageCounts
  };
}

export default useTags;