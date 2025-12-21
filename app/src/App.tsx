import { Dispatch, useState } from "react";
import PlanCreation from "./components/PlanCreation";
import Preview from "./components/Preview";

function App() {
  const [preview, setPreview]: [string | null, Dispatch<any>] = useState(null);
  return preview ? (
    <Preview returnToCreation={() => setPreview(null)} preview={preview} />
  ) : (
    <PlanCreation setPreview={setPreview} />
  );
}

export default App;
