# 🚀 DocForge — High-Performance, Privacy-First PDF Suite

> **DocForge** is a modern, ultra-fast, and secure document processing web application. Built with a **100% Zero-Storage in-memory architecture**, DocForge ensures your sensitive documents and credentials never touch server disks or cloud storage.

---

## ✨ Key Features

| Tool | Description | Highlights |
| :--- | :--- | :--- |
| 📑 **Merge PDF** | Combine multiple PDF files into one clean document | Instant in-memory stitching, drag-and-drop file reordering |
| 🖼️ **Image to PDF** | Convert JPG, PNG, and WebP images to a unified PDF | Automatic scaling, lossless image conversion with Sharp |
| ✍️ **Text to PDF** | Convert raw text, notes, markdown, or `.txt` files into PDF | Multi-page pagination, auto line-wrapping, customizable fonts & sizes |
| 🔒 **Protect PDF** | Encrypt PDFs with industry-standard **AES-256 encryption** | Owner passwords, granular permissions (printing, copying, editing) |

---

## 🛡️ Privacy & Zero-Storage Architecture

DocForge is designed from the ground up for **maximum privacy and enterprise security**:

```
[ Client Browser ]  ──( Multipart Form )──►  [ DocForge Backend RAM ]
                                                       │
                                              ( In-Memory Buffer )
                                                       │
[ Client Downloads ] ◄──( Direct Stream Blob )─── [ PDF Engine ]
```

* **0 MB Disk Storage**: No uploaded files or converted PDFs are ever written to server hard drives.
* **Transient In-Memory Streams**: All transformations execute in RAM and are immediately garbage-collected once the response streams back to the browser.
* **Instant Client-Side Downloads**: Documents are directly downloaded via browser Blobs without intermediate cloud file hosting.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** + **Vite** — High-speed modern client application
* **Framer Motion** — Fluid micro-animations and page transitions
* **Lucide React** — Crisp, modern vector iconography
* **pdf-lib** — Fast client-side PDF document manipulation & typography rendering
* **Axios** — Streamlined multipart and binary blob HTTP requests
* **Vanilla CSS** — Custom glassmorphism, responsive grid layouts, dark mode palette

### Backend
* **Node.js** + **Express 5** — REST API endpoints
* **Multer (MemoryStorage)** — RAM-based multipart file handling (zero disk I/O)
* **@pdfsmaller/pdf-encrypt** — AES-256 document encryption & permission flags
* **Sharp** — High-performance image processing pipeline
* **pdf-lib** — PDF document creation, page manipulation, and stitching
* **CORS & Dotenv** — Configurable cross-origin policies and environment settings

---

## 📂 Project Structure

```
DocForge/
├── backend/
│   ├── controllers/
│   │   └── pdfController.js     # In-memory PDF operations & streaming
│   ├── routes/
│   │   └── pdfRoutes.js          # Memory-storage Multer endpoints
│   ├── .env                      # Backend configuration (PORT, etc.)
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server initialization
│
├── frontend/
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConvertTool.jsx   # Image to PDF interface
│   │   │   ├── MergeTool.jsx     # PDF Merger interface
│   │   │   ├── Navbar.jsx        # Navigation bar & branding
│   │   │   ├── ProtectTool.jsx   # AES-256 encryption interface
│   │   │   ├── SupportModal.jsx  # Support & Feedback modal
│   │   │   └── TextTool.jsx      # Text to PDF generator interface
│   │   ├── pages/
│   │   │   └── Home.jsx          # Hero section & tool showcase
│   │   ├── App.jsx               # Main application component & routing
│   │   ├── config.js             # API base URL configuration
│   │   ├── index.css             # Design tokens & glassmorphism theme
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html                # HTML entry template
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite bundler configuration
│
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* `npm` or `yarn`

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend API will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Verify `frontend/src/config.js`:
   ```javascript
   export const API_BASE = 'http://localhost:5000';
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`.*

---

## 🌐 Production Deployment

Because DocForge uses **in-memory streaming**, it requires **no persistent disk volumes or cloud bucket configuration**:

### Deploying Frontend (Vercel / Netlify)
1. Set the build command to `npm run build` and publish directory to `dist`.
2. Update `API_BASE` in `frontend/src/config.js` or set an environment variable `VITE_API_URL` to point to your live backend domain.

### Deploying Backend (Render / Railway / VPS / Docker)
1. Deploy `backend` as a Node.js web service.
2. Set build command to `npm install` and start command to `node server.js`.
3. Set environment variable `PORT=5000` (or leave default for your hosting provider).

---

## 🔒 Security Best Practices
* **Zero Residual Data**: No document data is stored on disk or in databases.
* **AES-256 Encryption**: Password protection uses standard encryption compatible with Adobe Acrobat and all standard PDF readers.
* **File Size Limits**: Built-in 50MB memory buffer limit per file prevents memory overflow.

---

## 📄 License
This project is licensed under the **ISC License**.
