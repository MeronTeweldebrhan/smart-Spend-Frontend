// src/Context/RoomsUpdateContext.jsx
import React, { createContext, useState, useContext } from "react";

const RoomsUpdateContext = createContext();

export function RoomsUpdateProvider({ children }) {
  const [roomsVersion, setRoomsVersion] = useState(0);
  return (
    <RoomsUpdateContext.Provider value={{ roomsVersion, setRoomsVersion }}>
      {children}
    </RoomsUpdateContext.Provider>
  );
}

export function useRoomsUpdate() {
  return useContext(RoomsUpdateContext);
}
