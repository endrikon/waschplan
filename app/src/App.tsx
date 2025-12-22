import { Dispatch, useState } from "react";
import PlanCreation from "./components/PlanCreation";
import Preview from "./components/Preview";
import { Apartment, Floor } from "./components/Floors";
import { Position } from "./components/LastToWash";

function App() {
  let initialFloors: Map<Floor, Apartment> = new Map([
    ["P", { kind: "OneApartment", daysTotal: 1 }],
  ]);
  const [floors, setFloors] = useState(initialFloors);
  const [removeRowDisabled, setRemoveRowDisabled] = useState(true);
  const [year, setYear] = useState("");
  const [address, setAddress] = useState("");
  const [lastFloor, setLastFloor]: [Floor | "", Dispatch<any>] = useState("");
  const [lastPosition, setLastPosition]: [Position | "", Dispatch<any>] =
    useState("");
  const [lastDay, setLastDay]: [number, Dispatch<any>] = useState(0);
  const [maxDays, setMaxDays]: [number, Dispatch<any>] = useState(0);
  const [holidayDates, setHolidayDates]: [[Date, String][], Dispatch<any>] =
    useState([]);
  const [sundayAllowed, setSundayAllowed] = useState(false);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [regionList, setRegionList]: [[string, string][], Dispatch<any>] =
    useState([]);
  const [lastApartment, setLastApartment]: [
    Apartment | undefined,
    Dispatch<any>,
  ] = useState(undefined);

  const [preview, setPreview]: [string | null, Dispatch<any>] = useState(null);
  return preview ? (
    <Preview returnToCreation={() => setPreview(null)} preview={preview} />
  ) : (
    <PlanCreation
      setPreview={setPreview}
      floors={floors}
      setFloors={setFloors}
      removeRowDisabled={removeRowDisabled}
      setRemoveRowDisabled={setRemoveRowDisabled}
      year={year}
      setYear={setYear}
      address={address}
      setAddress={setAddress}
      lastFloor={lastFloor}
      setLastFloor={setLastFloor}
      lastPosition={lastPosition}
      setLastPosition={setLastPosition}
      lastDay={lastDay}
      setLastDay={setLastDay}
      maxDays={maxDays}
      setMaxDays={setMaxDays}
      holidayDates={holidayDates}
      setHolidayDates={setHolidayDates}
      sundayAllowed={sundayAllowed}
      setSundayAllowed={setSundayAllowed}
      country={country}
      setCountry={setCountry}
      region={region}
      setRegion={setRegion}
      regionList={regionList}
      setRegionList={setRegionList}
      lastApartment={lastApartment}
      setLastApartment={setLastApartment}
    />
  );
}

export default App;
