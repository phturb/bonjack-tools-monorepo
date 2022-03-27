import { Box, Typography } from "@mui/material";

export type FooterProperties = {};

const Footer = (props : FooterProperties) => {
    return (<footer className="footer">
        <Box><Typography>Made with ❤️ by Philippe Turner</Typography></Box>
    </footer>);
};

export default Footer;