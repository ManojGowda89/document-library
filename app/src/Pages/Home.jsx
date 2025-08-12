import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Fade,
  Chip,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import WarningIcon from "@mui/icons-material/Warning";
import axios from "axios";

const API_URL = "/api"; // Update if needed

const acceptTypes = {
  images: "image/*",
  videos: "video/*",
  audio: "audio/*",
  documents: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf",
};

const Home = ({ type = "images" }) => {
  const theme = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // For duplicate file handling
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentBase64, setCurrentBase64] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const fileInputRef = useRef(null);

  // Convert file to Base64 (without data: prefix)
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  // Fetch all files of the current type
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/all/${type}`);
      setFiles(res.data);
    } catch (err) {
      console.error("Fetch files error:", err);
      setFiles([]);
      setSnackbar({ open: true, message: "Failed to load files", severity: "error" });
    }
    setLoading(false);
  }, [type]);

  useEffect(() => {
    fetchFiles();
  }, [type, fetchFiles]);

  // Upload file with the given name and base64 data
  const uploadFile = async (fileName, base64Data, fileType) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      await axios.post(
        `${API_URL}/upload`,
        {
          type,
          name: fileName,
          base64: base64Data,
          mimetype: fileType,
        },
        {
          onUploadProgress: (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percent);
            }
          },
        }
      );
      setSnackbar({ open: true, message: "File uploaded successfully", severity: "success" });
      fetchFiles();
      return true;
    } catch (err) {
      console.error("Upload error:", err);
      
      // Check for duplicate file error message
      if (err.response?.data?.message === "File with the same name already exists") {
        return false; // Return false to indicate duplicate error
      }
      
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Upload failed", 
        severity: "error" 
      });
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const base64 = await toBase64(file);
      
      // Try uploading the file
      const success = await uploadFile(file.name, base64, file.type);
      
      // If upload failed due to duplicate, show dialog
      if (!success) {
        // Check if the error is due to duplicate file
        const isDuplicate = files.some(existingFile => 
          existingFile.name.toLowerCase() === file.name.toLowerCase()
        );
        
        if (isDuplicate) {
          // Store current file data for dialog actions
          setCurrentFile(file);
          setCurrentBase64(base64);
          setNewFileName(getFileNameWithSuffix(file.name));
          setDuplicateDialog(true);
        }
      }
    } catch (err) {
      console.error("File processing error:", err);
      setSnackbar({ open: true, message: "Failed to process file", severity: "error" });
    }
  };

  // Generate a new filename with suffix for duplicates
  const getFileNameWithSuffix = (filename) => {
    const nameParts = filename.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${baseName}_${timestamp}.${extension}`;
  };

  // Handle duplicate file resolution - rename option
  const handleRenameFile = async () => {
    if (!currentFile || !currentBase64 || !newFileName) return;
    
    const success = await uploadFile(newFileName, currentBase64, currentFile.type);
    if (success) {
      setDuplicateDialog(false);
      setCurrentFile(null);
      setCurrentBase64(null);
      setNewFileName("");
    }
  };

  // Handle duplicate file resolution - replace option
  const handleReplaceFile = async () => {
    if (!currentFile || !currentBase64) return;
    
    try {
      // First delete the existing file
      await axios.delete(`${API_URL}/${type}/${currentFile.name}`);
      
      // Then upload the new one
      const success = await uploadFile(currentFile.name, currentBase64, currentFile.type);
      if (success) {
        setDuplicateDialog(false);
        setCurrentFile(null);
        setCurrentBase64(null);
        setNewFileName("");
      }
    } catch (err) {
      console.error("Replace file error:", err);
      setSnackbar({ open: true, message: "Failed to replace file", severity: "error" });
    }
  };

  // Download file helper
  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete single file
  const deleteFile = async (filename) => {
    try {
      await axios.delete(`${API_URL}/${type}/${filename}`);
      fetchFiles();
      setSnackbar({ open: true, message: "File deleted successfully", severity: "info" });
    } catch (err) {
      console.error("Delete file error:", err);
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setSnackbar({ open: true, message: "URL copied to clipboard", severity: "success" });
    } catch (err) {
      console.error("Copy to clipboard failed", err);
      setSnackbar({ open: true, message: "Failed to copy URL", severity: "error" });
    }
  };

  // Get file size in human readable format
  const getFileSize = (size) => {
    if (!size) return "Unknown";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate appropriate grid size based on media type
  const getGridSize = () => {
    switch(type) {
      case 'images': return { xs: 12, sm: 6, md: 4, lg: 3 };
      case 'videos': return { xs: 12, sm: 6, md: 4 };
      case 'audio': return { xs: 12, sm: 6 };
      case 'documents': return { xs: 12, sm: 6, md: 4 };
      default: return { xs: 12, sm: 6, md: 4 };
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <DescriptionIcon />;
    if (mimeType.startsWith('image/')) return <img src="/icons/image.svg" alt="img" width={24} />;
    if (mimeType.startsWith('video/')) return <img src="/icons/video.svg" alt="video" width={24} />;
    if (mimeType.startsWith('audio/')) return <img src="/icons/audio.svg" alt="audio" width={24} />;
    return <DescriptionIcon />;
  };

  // Get the appropriate title for the current type
  const getTypeTitle = () => {
    switch(type) {
      case 'images': return 'Image Gallery';
      case 'videos': return 'Video Collection';
      case 'audio': return 'Audio Library';
      case 'documents': return 'Document Repository';
      default: return 'Media Files';
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        my: 8,
        p: 4,
        borderRadius: 2,
        bgcolor: 'background.paper',
        textAlign: 'center'
      }}
    >
      <Box 
        component="img" 
        src={`/illustrations/empty-${type}.svg`} 
        alt="No files" 
        sx={{ width: '100%', maxWidth: 200, mb: 3, opacity: 0.7 }}
      />
      <Typography variant="h6" gutterBottom>
        No {type} found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload your first file to get started
      </Typography>
      <Button 
        variant="contained" 
        component="label" 
        startIcon={<CloudUploadIcon />}
        disabled={uploading}
      >
        Upload {type.slice(0, -1)}
        <input 
          type="file" 
          hidden 
          ref={fileInputRef}
          accept={acceptTypes[type]} 
          onChange={handleFileChange} 
        />
      </Button>
    </Box>
  );

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        ml: { sm: 0, md: '250px' },
        transition: theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', 
            opacity: 0.05, 
            backgroundImage: `url(/patterns/${type}-pattern.svg)`,
            backgroundSize: 'cover',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" gutterBottom>
              {getTypeTitle()}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your {type} files with ease. Upload, download, and organize your media collection.
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button 
                  variant="contained" 
                  component="label" 
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                >
                  Upload {type.slice(0, -1)}
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef}
                    accept={acceptTypes[type]} 
                    onChange={handleFileChange} 
                  />
                </Button>
              </Grid>
              
              <Grid item>
                <Tooltip title="Filter">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              
              <Grid item>
                <Tooltip title="Sort">
                  <IconButton>
                    <SortIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              
              <Grid item xs>
                {files.length > 0 && (
                  <Chip 
                    label={`${files.length} ${files.length === 1 ? 'file' : 'files'}`} 
                    size="small" 
                    sx={{ ml: 'auto', mr: 2 }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Upload Progress */}
        {uploading && (
          <Fade in={uploading} timeout={500}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Paper>
          </Fade>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && files.length === 0 && renderEmptyState()}

        {/* Files Grid */}
        {!loading && files.length > 0 && (
          <Grid container spacing={3}>
            {files.map((file) => (
              <Grid item key={file.name} {...getGridSize()}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {type === "images" && (
                    <CardMedia 
                      component="img" 
                      height={200} 
                      image={file.url} 
                      alt={file.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}

                  {type === "videos" && (
                    <Box sx={{ position: 'relative', pt: '56.25%' /* 16:9 aspect ratio */ }}>
                      <video 
                        controls 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: '#000'
                        }}
                      >
                        <source src={file.url} type={file.mimetype || "video/mp4"} />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  )}

                  {type === "audio" && (
                    <Box 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      }}
                    >
                      <Box 
                        component="img" 
                        src="/icons/audio-wave.svg" 
                        alt="Audio" 
                        sx={{ 
                          width: '100%', 
                          height: 80, 
                          objectFit: 'contain',
                          opacity: 0.7,
                          mb: 2
                        }}
                      />
                      <audio controls style={{ width: '100%' }}>
                        <source src={file.url} type={file.mimetype || "audio/mpeg"} />
                        Your browser does not support the audio tag.
                      </audio>
                    </Box>
                  )}

                  {type === "documents" && (
                    <Box 
                      sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 150,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      component="div" 
                      noWrap
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {file.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getFileSize(file.size)} • {formatDate(file.lastModified)}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Tooltip title="Download">
                      <IconButton 
                        size="small" 
                        onClick={() => downloadFile(file)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Copy URL">
                      <IconButton 
                        size="small" 
                        onClick={() => copyUrlToClipboard(file.url)}
                        color="info"
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => deleteFile(file.name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Duplicate File Dialog */}
      <Dialog
        open={duplicateDialog}
        onClose={() => setDuplicateDialog(false)}
        aria-labelledby="duplicate-dialog-title"
      >
        <DialogTitle id="duplicate-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          File Already Exists
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            A file with the name "{currentFile?.name}" already exists. What would you like to do?
          </DialogContentText>
          
          <Typography variant="subtitle2" gutterBottom>
            Rename file:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleReplaceFile} color="warning">
            Replace Existing
          </Button>
          <Button onClick={handleRenameFile} color="primary" variant="contained">
            Upload as New
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;