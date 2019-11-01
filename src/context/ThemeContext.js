import React, { useState } from "react";

const ThemeContext = React.createContext(null);
function ThemeProvider(props) {
  const [theme, setTheme] = useState("white");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext, ThemeProvider };
