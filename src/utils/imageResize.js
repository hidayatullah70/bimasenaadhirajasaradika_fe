/**
 * Utility for resizing and center-cropping photos to 3:4 aspect ratio (standard Indonesian ID / Pas Foto).
 * Target resolution: 300 x 400 px (3:4 ratio).
 */

export function resizeImageTo3x4(source, targetWidth = 300, targetHeight = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Tidak dapat menginisialisasi canvas context'));
          return;
        }

        const targetRatio = targetWidth / targetHeight; // 0.75
        const srcRatio = img.width / img.height;

        let srcX = 0;
        let srcY = 0;
        let srcW = img.width;
        let srcH = img.height;

        if (srcRatio > targetRatio) {
          // Source is wider than 3:4 -> crop sides
          srcW = img.height * targetRatio;
          srcX = (img.width - srcW) / 2;
        } else {
          // Source is taller than 3:4 -> crop top/bottom
          srcH = img.width / targetRatio;
          srcY = (img.height - srcH) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onload = handleLoad;
    img.onerror = () => reject(new Error('Gagal membaca gambar. Pastikan format file valid.'));

    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof Blob || source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
      reader.readAsDataURL(source);
    } else {
      reject(new Error('Format file tidak didukung.'));
    }
  });
}
