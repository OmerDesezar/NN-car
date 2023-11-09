import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ThemeProvider, createTheme } from "@mui/material";
import theme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));

const customTheme = createTheme(theme);

root.render(
	<React.StrictMode>
		<ThemeProvider theme={customTheme}>
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
