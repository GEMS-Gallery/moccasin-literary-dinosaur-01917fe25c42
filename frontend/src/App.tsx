import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { backend } from 'declarations/backend';
import { Container, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box, LinearProgress } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon, Image as ImageIcon } from '@mui/icons-material';
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

const Thumbnail = styled('img')({
  width: '50px',
  height: '50px',
  objectFit: 'cover',
  marginRight: '16px',
});

interface File {
  name: string;
  size: bigint;
  uploadTime: bigint;
  thumbnailUrl?: string;
}

const App: React.FC = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress(progress);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          const content = new Uint8Array(xhr.response);
          let thumbnailUrl = null;
          if (file.type.startsWith('image/')) {
            thumbnailUrl = URL.createObjectURL(file);
          }
          const result = await backend.uploadFile(file.name, content, thumbnailUrl);
          if ('ok' in result) {
            setFiles(prevFiles => [...prevFiles, result.ok]);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      } else {
        console.error('Upload failed');
      }
      setUploading(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      console.error('Upload failed');
      setUploading(false);
      setUploadProgress(0);
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      await backend.deleteFile(fileName);
      setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: bigint) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === BigInt(0)) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(Number(bytes)) / Math.log(1024)).toString());
    return Math.round(Number(bytes) / Math.pow(1024, i)) + ' ' + sizes[i];
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
            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
            <DropZone>
              <Typography>Drag and drop files here or click the Upload button</Typography>
            </DropZone>
            <List>
              {files.map((file: File) => (
                <ListItem key={file.name}>
                  {file.thumbnailUrl ? (
                    <Thumbnail src={file.thumbnailUrl} alt={file.name} />
                  ) : (
                    file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.png') ? (
                      <ImageIcon sx={{ mr: 2, fontSize: 40 }} />
                    ) : (
                      <FileIcon sx={{ mr: 2, fontSize: 40 }} />
                    )
                  )}
                  <ListItemText
                    primary={file.name}
                    secondary={`Size: ${formatFileSize(file.size)} | Uploaded: ${new Date(Number(file.uploadTime) / 1000000).toLocaleString()}`}
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
