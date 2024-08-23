import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { backend } from 'declarations/backend';
import { Container, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

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

const App: React.FC = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated]);

  const fetchFiles = async () => {
    try {
      const fileList = await backend.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = new Uint8Array(e.target?.result as ArrayBuffer);
        await backend.uploadFile(file.name, content);
        await fetchFiles();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      await backend.deleteFile(fileName);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Modern Dropbox Clone
        </Typography>
        {isAuthenticated ? (
          <>
            <Button variant="contained" color="primary" onClick={logout} sx={{ mb: 2 }}>
              Logout
            </Button>
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
                sx={{ ml: 2, mb: 2 }}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </label>
            <DropZone>
              <Typography>Drag and drop files here or click the Upload button</Typography>
            </DropZone>
            <List>
              {files.map((file: any) => (
                <ListItem key={file.name}>
                  <ListItemText
                    primary={file.name}
                    secondary={`Size: ${formatFileSize(Number(file.size))}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file.name)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Button variant="contained" color="primary" onClick={login}>
            Login with Internet Identity
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default App;
