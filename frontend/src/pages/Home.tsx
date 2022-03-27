import { Box, Container, Typography } from "@mui/material";

export type HomeProperties = {};

const Home = (props: HomeProperties) => {
    return (<Container>
        <Typography variant="h4" component="h4" align="center">Home</Typography>
        <Box>
            <Typography>
                This is a website for various personnal project
            </Typography>
        </Box>
    </Container>);
};

export default Home;