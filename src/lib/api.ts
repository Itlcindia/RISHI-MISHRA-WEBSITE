const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

export const galleryService = {
  // Get all images
  getAll: async () => {
    const res = await fetch(`${API_URL}/gallery`);
    return res.json();
  },

  // Upload image
  upload: async (data: { imageUrl: string; captionEn: string; captionHi: string }) => {
    const res = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Delete image
  delete: async (id: number) => {
    await fetch(`${API_URL}/gallery/${id}`, { method: 'DELETE' });
  }
};
