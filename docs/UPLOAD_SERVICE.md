# Upload Service

Simple file upload with group-based folder organization.

## Quick Start

```javascript
import upload from '../middlewares/upload.js';
import { upload as uploadFile } from '../services/UploadService.js';

// 1. Add middleware  2. Call uploadFile
router.post('/image', upload('products').single('file'), async (req, res) => {
  const result = await uploadFile(req.file, 'products');
  res.json(result);
});
```

**Result:** File saved to `uploads/products/1735849200000-abc123.jpg`

---

## Add Upload Groups

Edit `src/config/upload.js`:

```javascript
export const uploadGroups = {
  general: {
    types: ALLOWED_TYPES.image,
    maxSize: MAX_FILE_SIZES.default,
  },

  // Add your groups:
  products: {
    types: ALLOWED_TYPES.image,
    maxSize: 10 * 1024 * 1024, // 10MB
  },

  documents: {
    types: ALLOWED_TYPES.document,
    maxSize: 20 * 1024 * 1024, // 20MB
  },

  avatars: {
    types: ALLOWED_TYPES.image,
    maxSize: 2 * 1024 * 1024, // 2MB
  },
};
```

---

## Available Types

```javascript
ALLOWED_TYPES.image; // jpeg, png, gif, webp
ALLOWED_TYPES.document; // pdf, doc, docx
ALLOWED_TYPES.video; // mp4, mpeg, mov
ALLOWED_TYPES.all; // null = allow everything
```

---

## Examples

**Single file:**

```javascript
router.post('/avatar', upload('avatars').single('file'), async (req, res) => {
  const result = await uploadFile(req.file, 'avatars');
  res.json(result);
});
```

**Multiple files:**

```javascript
import { uploadMany } from '../services/UploadService.js';

router.post('/gallery', upload('products').array('files', 5), async (req, res) => {
  const results = await uploadMany(req.files, 'products');
  res.json(results);
});
```

**Delete:**

```javascript
import { deleteFile } from '../services/UploadService.js';

await deleteFile('/uploads/products/image.jpg');
```

---

## Storage

**Local (default):**

```env
UPLOAD_STRATEGY=local
UPLOAD_LOCAL_PATH=uploads
```

**Cloudinary:**

```env
UPLOAD_STRATEGY=cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## Response

```javascript
{
  success: true,
  url: "/uploads/products/1735849200000-abc123.jpg",
  filename: "1735849200000-abc123.jpg",
  originalName: "my-image.jpg",
  size: 245678,
  mimetype: "image/jpeg",
  type: "image",
  group: "products",
  storage: "local"
}
```
