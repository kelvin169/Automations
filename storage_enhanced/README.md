# Enhanced Personal Cloud Storage

An advanced version of the personal cloud storage application with improved UI, better file management, and additional features.

## Features

### Enhanced User Interface
- Modern, responsive design with gradient backgrounds
- Drag-and-drop file upload area with visual feedback
- File preview for images (thumbnails) and file type icons for other formats
- Search/filter functionality to find files quickly
- File cards with hover effects and action buttons
- Statistics bar showing file count, storage used, and upload speed

### Improved File Management
- Upload multiple files at once (up to 10 files)
- Increased file size limit (15MB per file)
- Better filename handling with timestamp and random string to prevent collisions
- File type detection and appropriate icons
- Secure file deletion with confirmation dialog
- Progress bars for uploads with visual feedback

### Backend Enhancements
- Better error handling and validation
- Path traversal protection for all file operations
- Enhanced logging and debugging capabilities
- Storage statistics endpoint
- Improved file listing with metadata (upload date, MIME type)
- Efficient file streaming for downloads

### Security Features
- Comprehensive path traversal protection
- File type validation (with warnings for uncommon types)
- Size and quantity limits for uploads
- Secure file deletion

## Technology Stack

- **Backend**: Node.js with Express.js
- **File Uploads**: Multer middleware
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Font Awesome Icons
- **Additional Packages**: mime-types for file type detection

## Installation

1. Navigate to the storage_enhanced directory:
   ```bash
   cd storage_enhanced
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:5003/storage
   ```

## API Endpoints

### File Operations
- `POST /api/upload` - Upload one or more files
- `GET /api/files` - List all uploaded files with metadata
- `GET /api/files/:filename` - Download a specific file
- `DELETE /api/files/:filename` - Delete a specific file
- `GET /api/storage/stats` - Get storage statistics (file count, total size)

### Existing Functionality (from original server)
- `GET /` - Logger page
- `GET /api/logs` - Get all log entries
- `POST /api/log` - Add a new log entry
- `GET /api/configurations` - Get all configurations
- `POST /api/configurations` - Create a new configuration
- etc.

## Usage

### Uploading Files
1. Click the "Select Files" button or drag files to the upload area
2. Select one or more files (maximum 10 files, 15MB each)
3. Watch the progress bar as files upload
4. Files will appear in the grid once uploaded

### Managing Files
- **Download**: Click the download button on any file card
- **Delete**: Click the delete button and confirm in the modal
- **Search**: Type in the search box to filter files by name
- **Refresh**: File list and stats update automatically

## File Type Support
The application supports previewing/thumbnails for:
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, TXT, DOC, DOCX, XLS, XLSX
- Archives: ZIP, RAR
- Media: MP3, WAV, MP4, AVI

All other file types will display a generic file icon.

## Security Notes
- All file operations include path traversal protection
- Filenames are sanitized to prevent directory access outside storage
- File size is limited to 15MB per file to prevent abuse
- Only 10 files can be uploaded at once
- Uncommon file types are logged for monitoring

## Folder Structure
```
storage_enhanced/
├── public/
│   └── storage.html      # Enhanced UI
├── storage/              # Uploaded files storage (auto-created)
├── server.js             # Enhanced server logic
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Customization

### Changing Port
Modify the port in `server.js`:
```javascript
const port = process.env.PORT || 5003; // Change 5003 to desired port
```

### Adjusting File Limits
In `server.js`, modify the multer configuration:
```javascript
limits: {
  fileSize: 15 * 1024 * 1024, // Change 15 to desired MB limit
  files: 10                   // Change 10 to desired max files
}
```

### Changing UI Colors
Edit the CSS variables in `public/storage.css` or modify the gradient colors in the header section.