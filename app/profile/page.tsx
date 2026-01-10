"use client";

import { Container, Typography } from "@mui/material";

export default function Profile() {
  return (
    <Container
      maxWidth="md"
      className="min-h-screen flex flex-col items-center justify-center"
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Page
      </Typography>
      <Typography>This is the user profile page.</Typography>
    </Container>
  );
}
