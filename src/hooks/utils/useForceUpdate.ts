import { useState } from "react";

/** Returns a function that can be called to force the component to rerender */
export default function useForceUpdate() {
    const [/*val*/, setIncr] = useState(0);
    // Using callback form of setIncr so that the same useForceUpdate function can be called multiple times
    return () => setIncr((val) => val + 1);
}
