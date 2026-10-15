/**
 * Image Resize Utility — PT. BARAK IOMS
 * Automatically crops and resizes images to standard aspect ratios using HTML5 Canvas.
 * - resizeImageTo16x9: for Field Coordinator (PIC) activity report photos.
 * - resizeImageTo3x4: for employee formal profile / ID card photos.
 */

/**
 * Resize and center-crop an uploaded image file to 16:9 aspect ratio.
 *
 * @param {File} file - Uploaded File object from input[type="file"]
 * @param {number} [targetWidth=1280] - Target width in pixels (default 1280x720)
 * @returns {Promise<{
 *   dataUrl: string,
 *   width: number,
 *   height: number,
 *   ratio: string,
 *   originalWidth: number,
 *   originalHeight: number,
 *   originalName: string,
 *   sizeKb: number
 * }>}
 */
export function resizeImageTo16x9(file, targetWidth = 960, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang diunggah harus berupa file gambar (JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari device.'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses gambar. Format gambar mungkin rusak.'));

      img.onload = () => {
        // 16:9 target dimensions
        const targetHeight = Math.round((targetWidth * 9) / 16);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Browser tidak mendukung manipulasi grafis canvas.'));
          return;
        }

        // Determine center-crop coordinates to achieve exact 16:9 without distortion
        const targetRatio = 16 / 9;
        const sourceRatio = img.width / img.height;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = img.width;
        let cropHeight = img.height;

        if (sourceRatio > targetRatio) {
          // Source is wider than 16:9 -> crop left and right margins
          cropWidth = Math.round(img.height * targetRatio);
          cropX = Math.round((img.width - cropWidth) / 2);
        } else if (sourceRatio < targetRatio) {
          // Source is taller than 16:9 (e.g. portrait/square) -> crop top and bottom margins
          cropHeight = Math.round(img.width / targetRatio);
          cropY = Math.round((img.height - cropHeight) / 2);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          ratio: '16:9',
          originalWidth: img.width,
          originalHeight: img.height,
          originalName: file.name,
          sizeKb,
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resize and center-crop an uploaded image file to 3:4 aspect ratio (standard formal photo).
 *
 * @param {File} file - Uploaded File object
 * @param {number} [targetWidth=300] - Target width in pixels (300x400)
 * @returns {Promise<string>} Data URL base64 string
 */
export function resizeImageTo3x4(file, targetWidth = 300) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        const targetHeight = Math.round((targetWidth * 4) / 3);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas tidak didukung'));
          return;
        }

        const targetRatio = 3 / 4;
        const sourceRatio = img.width / img.height;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = img.width;
        let cropHeight = img.height;

        if (sourceRatio > targetRatio) {
          cropWidth = Math.round(img.height * targetRatio);
          cropX = Math.round((img.width - cropWidth) / 2);
        } else if (sourceRatio < targetRatio) {
          cropHeight = Math.round(img.width / targetRatio);
          cropY = Math.round((img.height - cropHeight) / 2);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and center-crop an uploaded image file to 1:1 aspect ratio (square profile picture / avatar).
 *
 * @param {File} file - Uploaded File object
 * @param {number} [targetSize=256] - Target width & height in pixels (256x256)
 * @returns {Promise<string>} Data URL base64 string
 */
export function resizeImageToSquare(file, targetSize = 256) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa file gambar (JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat format gambar. File mungkin rusak.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Browser tidak mendukung Canvas grafis.'));
          return;
        }

        // Center-crop to 1:1 square
        let cropX = 0;
        let cropY = 0;
        let cropSize = Math.min(img.width, img.height);

        if (img.width > img.height) {
          cropX = Math.round((img.width - cropSize) / 2);
        } else if (img.height > img.width) {
          // Keep a slight bias towards top for portraits/faces (top 20% rather than pure center)
          cropY = Math.round((img.height - cropSize) * 0.25);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, targetSize, targetSize);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default {
  resizeImageTo16x9,
  resizeImageTo3x4,
  resizeImageToSquare,
};

