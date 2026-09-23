const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5002; // Changed default port to 5002

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

// FILE STORAGE FUNCTIONALITY
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/');
  },
  filename: (req, file, cb) => {
    // Use the original name, but we can add a timestamp to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    // Accept all files for personal use
    cb(null, true);
  }
});

// POST /api/upload - Upload a file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({
    message: 'File uploaded successfully!',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    }
  });
});

// GET /api/files - List all uploaded files
app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');
  fs.readdir(storagePath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading storage directory');
    }
    const fileInfo = [];
    files.forEach(file => {
      const filePath = path.join(storagePath, file);
      const stats = fs.statSync(filePath);
      fileInfo.push({
        filename: file,
        originalname: file.replace(/^\d+-/, ''), // Remove the timestamp we added
        size: stats.size
      });
    });
    res.json(fileInfo);
  });
});

// GET /api/files/:filename - Download a file
app.get('/api/files/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, 'storage');
  // Prevent path traversal attacks
  const filePath = path.join(storagePath, req.params.filename);
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
    res.download(filePath); // Sets Content-Disposition to attachment
  });
});

// Route to serve the storage.html page
app.get('/storage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'storage.html'));
});

// Serve logger page at root (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logger.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});