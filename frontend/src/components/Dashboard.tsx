import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box, LinearProgress, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon, GetApp as DownloadIcon, Share as ShareIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import FilePreview from './FilePreview';

const DropZone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface File {
  name: string;
  size: bigint;
  uploadTime: bigint;
  content: Uint8Array;
  sharedWith: string[];
}

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const fileList = await backend.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
      showSnackbar('Error fetching files');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = new Uint8Array(e.target?.result as ArrayBuffer);
        const result = await backend.uploadFile(file.name, content);
        if ('ok' in result) {
          setFiles(prevFiles => [...prevFiles, result.ok]);
          showSnackbar('File uploaded successfully');
        }
        setUploading(false);
        setUploadProgress(100);
      };
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Error uploading file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      await backend.deleteFile(fileName);
      setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
      showSnackbar('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      showSnackbar('Error deleting file');
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      const result = await backend.downloadFile(fileName);
      if ('ok' in result) {
        const file = result.ok;
        const blob = new Blob([file.content]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSnackbar('File downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      showSnackbar('Error downloading file');
    }
  };

  const handleShareFile = (file: File) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleShareConfirm = async () => {
    if (selectedFile && recipientId) {
      try {
        await backend.shareFile(selectedFile.name, recipientId);
        showSnackbar('File shared successfully');
        setShareDialogOpen(false);
        setRecipientId('');
        fetchFiles();
      } catch (error) {
        console.error('Error sharing file:', error);
        showSnackbar('Error sharing file');
      }
    }
  };

  const formatFileSize = (bytes: bigint) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === BigInt(0)) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(Number(bytes)) / Math.log(1024)).toString());
    return Math.round(Number(bytes) / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          IC Box Dashboard
        </Typography>
        <input
          accept="*/*"
          style={{ display: 'none' }}
          id="contained-button-file"
          multiple
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </label>
        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
        <DropZone>
          <Typography>Drag and drop files here or click the Upload button</Typography>
        </DropZone>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Files
        </Typography>
        <List>
          {files.filter(file => !file.sharedWith.length).map((file: File) => (
            <ListItem key={file.name}>
              <FilePreview file={file} />
              <ListItemText
                primary={file.name}
                secondary={`Size: ${formatFileSize(file.size)} | Uploaded: ${new Date(Number(file.uploadTime) / 1000000).toLocaleString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="download" onClick={() => handleDownloadFile(file.name)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" aria-label="share" onClick={() => handleShareFile(file)}>
                  <ShareIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file.name)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Shared Files
        </Typography>
        <List>
          {files.filter(file => file.sharedWith.length > 0).map((file: File) => (
            <ListItem key={file.name}>
              <FilePreview file={file} />
              <ListItemText
                primary={file.name}
                secondary={`Size: ${formatFileSize(file.size)} | Uploaded: ${new Date(Number(file.uploadTime) / 1000000).toLocaleString()} | Shared with: ${file.sharedWith.join(', ')}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="download" onClick={() => handleDownloadFile(file.name)}>
                  <DownloadIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="recipient"
            label="Recipient's Public ID"
            type="text"
            fullWidth
            variant="standard"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShareConfirm}>Share</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
