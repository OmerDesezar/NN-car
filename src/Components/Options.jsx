import React from "react";
import { Box, Button, Select, Typography } from "@mui/material";

export const Options = () => {
	return (
		<Box display={"flex"} flexDirection={"column"}>
			<Typography variant='h4' sx={{ color: "lightblue" }}>
				Run#:0
			</Typography>
			<Typography variant='h4' sx={{ color: "lightblue" }}>
				Generation:0
			</Typography>
			<Button variant='contained'>Save</Button>
			<Select />
			<Button variant='contained'>some</Button>
			<Button variant='contained'>some else</Button>
			<Button variant='contained'>idk</Button>
		</Box>
	);
};
