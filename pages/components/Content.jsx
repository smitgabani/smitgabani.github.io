import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import styles from "../../styles/Home.module.css";
import Documents from "./Documents";
import Projects from "./Projects";
import Articles from "./Articles";
import Exprience from "./Exprience";
import Github from "./Github";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function returnTab(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Content() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={styles.content}>
      <>
        <Tabs
          component="span"
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab className="tab" label="General" {...returnTab(0)} />
          <Tab className="tab" label="Exprience" {...returnTab(1)} />
          <Tab className="tab" label="Projects" {...returnTab(2)} />
          <Tab className="tab" label="Articles/Notes" {...returnTab(3)} />
          <Tab className="tab" label="Github" {...returnTab(4)} />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Documents />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Exprience />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Projects />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Articles />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Github />
        </TabPanel>
      </>
    </div>
  );
}
