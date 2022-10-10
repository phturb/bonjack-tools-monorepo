import React from "react";
import { Box, Container, Typography } from "@mui/material";

const Home = () => {
  return (
    <Container>
      <Typography variant="h4" component="h4" align="center">
        Home
      </Typography>
      <Box>
        <Typography>This is a website for various personnal project</Typography>
      </Box>
    </Container>
  );
};

export default Home;
