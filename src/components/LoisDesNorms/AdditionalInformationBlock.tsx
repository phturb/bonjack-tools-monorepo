import { Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import Rules from "./Rules";
import Stats from "./Stats";

const AdditionalInformationBlock = () => {
  const [state, setState] = useState(0);

  return (
    <Paper>
      <Tabs
        value={state}
        onChange={(event, value) => {
          setState(value);
        }}
      >
        <Tab id="rules" label="Rules" value={0} />
        <Tab id="stats" label="Stats" value={1} />
      </Tabs>
      <div hidden={state !== 1} style={{ height: 300, width: 400 }}>
        <Stats />
      </div>
      <div hidden={state !== 0} style={{ height: 300, width: 400 }}>
        <Rules />
      </div>
    </Paper>
  );
};

export default AdditionalInformationBlock;
