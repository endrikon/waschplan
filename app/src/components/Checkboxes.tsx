import { useState } from "react";

interface CheckboxesProperties {
  onCheckHasParterre: (isChecked: boolean) => void;
  sundayAllowed: boolean;
  toggleSundayAllowed: () => void;
}

function Checkboxes({
  onCheckHasParterre,
  sundayAllowed,
  toggleSundayAllowed,
}: CheckboxesProperties) {
  const [withParterre, setWithParterre] = useState(true);

  return (
    <div className="columns">
      <div className="column is-full">
        <div className="checkboxes">
          <label className="checkbox is-size-4">
            <input
              type="checkbox"
              id="withParterre"
              checked={withParterre}
              onClick={() => setWithParterre(!withParterre)}
              onChange={() => onCheckHasParterre(withParterre)}
            />
            Parterre
          </label>
          <label className="checkbox is-size-4">
            <input
              type="checkbox"
              id="sunday"
              checked={sundayAllowed}
              onClick={toggleSundayAllowed}
            />
            Sonntag
          </label>
        </div>
      </div>
    </div>
  );
}

export default Checkboxes;
