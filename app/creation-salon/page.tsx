const images: Image[] = formData.images.map(image => ({
  image_url: image.image_url,
  image_type: image.image_type as "main" | "interior" | "food" | "other",
  display_order: image.display_order
})); 