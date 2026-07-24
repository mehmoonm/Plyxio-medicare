// jsPDF's addImage forces whatever width/height you give it, which
// squishes any non-square logo. This loads the image first to get its
// real dimensions, then fits it inside a bounding box while preserving
// aspect ratio.
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function fitBox(width: number, height: number, maxSize: number): { w: number; h: number } {
  if (!width || !height) return { w: maxSize, h: maxSize };
  const ratio = width / height;
  if (ratio >= 1) {
    return { w: maxSize, h: maxSize / ratio };
  }
  return { w: maxSize * ratio, h: maxSize };
}

export function detectImageFormat(dataUrl: string): 'JPEG' | 'PNG' {
  return dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG';
}
