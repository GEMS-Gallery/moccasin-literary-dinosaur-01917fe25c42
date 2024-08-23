import React from 'react';
import { Box, Typography } from '@mui/material';
import { InsertDriveFile as FileIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '100px',
  height: '100px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const ImagePreview = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

interface FilePreviewProps {
  file: {
    name: string;
    content: Uint8Array;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const isImage = file.name.match(/\.(jpeg|jpg|gif|png)$/) !== null;

  if (isImage) {
    const blob = new Blob([file.content]);
    const imageUrl = URL.createObjectURL(blob);
    return (
      <PreviewContainer>
        <ImagePreview src={imageUrl} alt={file.name} />
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <Box sx={{ textAlign: 'center' }}>
        <FileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        <Typography variant="caption" display="block">
          {file.name.split('.').pop()?.toUpperCase()}
        </Typography>
      </Box>
    </PreviewContainer>
  );
};

export default FilePreview;
