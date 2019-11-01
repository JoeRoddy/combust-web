import React, { useState } from "react";

const CountContext = React.createContext(0);
function CountProvider(props) {
  const [val, setVal] = useState(0);
  const increment = () => {
    console.log("increment called");
    return setVal(val + 1);
  };

  return (
    <CountContext.Provider value={{ val, increment }}>
      {props.children}
    </CountContext.Provider>
  );
}

export { CountContext, CountProvider };
