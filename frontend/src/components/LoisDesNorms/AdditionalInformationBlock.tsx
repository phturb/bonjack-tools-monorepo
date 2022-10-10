import React, { useState } from "react";
import { Paper, Tabs, Tab, Box } from "@mui/material";
import Rules from "./Rules";
import Stats from "./Stats";

const AdditionalInformationBlock = (props: { availablePlayers: any }) => {
  const [state, setState] = useState(0);

  return (
    <Paper>
      <Box
        sx={{
          padding: "10px",
          minHeight: "446px",
          width: "375px",
        }}
      >
        <Tabs
          value={state}
          onChange={(event, value) => {
            setState(value);
          }}
        >
          <Tab id="rules" label="Rules" value={0} />
          <Tab id="stats" label="Stats" value={1} />
        </Tabs>
        <div hidden={state !== 1} style={{ height: 360, width: 375 }}>
          <Stats availablePlayers={props.availablePlayers} />
        </div>
        <div hidden={state !== 0} style={{ height: 360, width: 375 }}>
          <Rules />
        </div>
      </Box>
    </Paper>
  );
};

export default AdditionalInformationBlock;
