const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5003; // Different port to avoid conflict

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for configurations (for simplicity)
// In a real application, you would use a database
let configurations = [];

// LOGGING FUNCTIONALITY
const logFilePath = path.join(__dirname, 'logs.txt');
// Ensure log file exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf8');
}

// GET all logs
app.get('/api/logs', (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).send('Error reading log file');
        }
        res.send(data);
    });
});

// POST a new log entry
app.post('/api/log', (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).send('Command is required');
    }
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} - ${command}\n`;
    fs.appendFile(logFilePath, logLine, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Error writing to log file');
        }
        res.status(201).send('Logged');
    });
});

// END LOGGING FUNCTIONALITY

// GET all configurations
app.get('/api/configurations', (req, res) => {
  res.json(configurations);
});

// GET a specific configuration by ID
app.get('/api/configurations/:id', (req, res) => {
  const config = configurations.find(c => c.id === parseInt(req.params.id));
  if (!config) return res.status(404).send('Configuration not found.');
  res.json(config);
});

// POST a new configuration
app.post('/api/configurations', (req, res) => {
  const config = {
    id: configurations.length ? configurations[configurations.length - 1].id + 1 : 1,
    ...req.body
  };
  configurations.push(config);
  res.status(201).json(config);
});

// PUT update a configuration
app.put('/api/configurations/:id', (req, res) => {
  const config = configurations.find(c => c.id === parseInt(req.params.id));
  if (!config) return res.status(404).send('Configuration not found.');

  // Update the configuration with the request body
  Object.assign(config, req.body);
  res.json(config);
});

// DELETE a configuration
app.delete('/api/configurations/:id', (req, res) => {
  const configIndex = configurations.findIndex(c => c.id === parseInt(req.params.id));
  if (configIndex === -1) return res.status(404).send('Configuration not found.');

  configurations.splice(configIndex, 1);
  res.status(204).send();
});

// ENHANCED FILE STORAGE FUNCTIONALITY
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // Increased to 15MB limit
    files: 10 // Limit to 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Accept all files for personal use, but warn about certain types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-rar-compressed',
      'audio/mpeg', 'audio/wav',
      'video/mp4', 'video/quicktime'
    ];

    // Allow all files but log warnings for uncommon types
    if (!allowedTypes.includes(file.mimetype)) {
      console.log(`Warning: Uncommon file type uploaded: ${file.mimetype}`);
    }
    cb(null, true);
  }
});

// Enhanced POST /api/upload - Upload a file with better feedback
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date().toISOString()
  }));

  res.json({
    message: `${req.files.length} file${req.files.length > 1 ? 's' : ''} uploaded successfully!`,
    files: uploadedFiles,
    count: req.files.length
  });
});

// Enhanced GET /api/files - List all uploaded files with more details
app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');

  // Ensure storage directory exists
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  fs.readdir(storagePath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading storage directory');
    }

    const filePromises = files.map(file => {
      const filePath = path.join(storagePath, file);
      return new Promise((resolve) => {
        fs.stat(filePath, (err, stats) => {
          if (err) {
            resolve(null);
          } else {
            resolve({
              filename: file,
              originalname: file.replace(/^(.+)-[\d\-]+(\.[^.]+)$/, '$1$2'), // Try to extract original name without timestamp-random
              size: stats.size,
              uploadedAt: stats.birthtime || stats.mtime,
              mimetype: require('mime-types').lookup(file) || 'application/octet-stream'
            });
          }
        });
      });
    });

    Promise.all(filePromises)
      .then(results => {
        const fileInfo = results.filter(Boolean); // Remove null values
        // Sort by upload date (newest first)
        fileInfo.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        res.json(fileInfo);
      })
      .catch(error => {
        console.error('Error processing files:', error);
        res.status(500).send('Error processing file information');
      });
  });
});

// Enhanced GET /api/files/:filename - Download a file with better security
app.get('/api/files/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');

  // Decode the filename to handle special characters
  let filename = decodeURIComponent(req.params.filename);

  // Prevent path traversal attacks
  const filePath = path.join(storagePath, filename);
  const resolvedPath = path.resolve(filePath);
  const resolvedStoragePath = path.resolve(storagePath);

  // Ensure the resolved path starts with the storage path
  if (!resolvedPath.startsWith(resolvedStoragePath)) {
    return res.status(400).send('Invalid filename');
  }

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    // Set appropriate headers for download
    const stats = fs.statSync(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURI(filename)}"`);
    res.setHeader('Content-Type', stats.isFile() ? 'application/octet-stream' : 'text/plain');
    res.setHeader('Content-Length', stats.size);

    // Create read stream for efficient file transfer
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

// Enhanced DELETE /api/files/:filename - Delete a file
app.delete('/api/files/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');

  // Decode the filename to handle special characters
  let filename = decodeURIComponent(req.params.filename);

  // Prevent path traversal attacks
  const filePath = path.join(storagePath, filename);
  const resolvedPath = path.resolve(filePath);
  const resolvedStoragePath = path.resolve(storagePath);

  // Ensure the resolved path starts with the storage path
  if (!resolvedPath.startsWith(resolvedStoragePath)) {
    return res.status(400).send('Invalid filename');
  }

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).send('Error deleting file');
      }
      res.status(200).send('File deleted successfully');
    });
  });
});

// GET storage stats - New endpoint for storage statistics
app.get('/api/storage/stats', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');

  // Ensure storage directory exists
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
    return res.json({ fileCount: 0, totalSize: 0, totalSizeMB: 0 });
  }

  fs.readdir(storagePath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading storage directory');
    }

    let totalSize = 0;
    let validFiles = 0;

    const filePromises = files.map(file => {
      const filePath = path.join(storagePath, file);
      return new Promise((resolve) => {
        fs.stat(filePath, (err, stats) => {
          if (!err && stats.isFile()) {
            totalSize += stats.size;
            validFiles++;
          }
          resolve();
        });
      });
    });

    Promise.all(filePromises)
      .then(() => {
        res.json({
          fileCount: validFiles,
          totalSize: totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        });
      })
      .catch(error => {
        console.error('Error calculating storage stats:', error);
        res.status(500).send('Error calculating storage statistics');
      });
  });
});

// Route to serve the enhanced storage.html page
app.get('/storage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'storage.html'));
});

// Serve logger page at root (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logger.html'));
});

app.listen(port, () => {
  console.log(`Enhanced Storage Server running on port ${port}`);
  console.log(`Access at: http://localhost:${port}/storage`);
});