import React from 'react';
import { Box, Container, Typography, Link, Divider, Stack, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Media Manager. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Link href="#" color="inherit" underline="hover">
              Privacy Policy
            </Link>
            <Typography color="text.secondary">•</Typography>
            <Link href="#" color="inherit" underline="hover">
              Terms of Service
            </Link>
            <Typography color="text.secondary">•</Typography>
            <Link href="#" color="inherit" underline="hover">
              Contact Us
            </Link>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <IconButton size="small" aria-label="github" color="inherit">
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="linkedin" color="inherit">
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="twitter" color="inherit">
              <TwitterIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;