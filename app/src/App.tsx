import { invoke } from "@tauri-apps/api/core";
import "./assets/bulma.min.css";
import "./assets/bulma-calendar.min.css";
import {
  Floor,
  Apartment,
  removeApartment,
  addApartment,
  setDaysLeft,
  nextFloor,
  apartmentToObject,
  floorToString,
  floorToNum,
} from "./components/Floors";
import Floors from "./components/Floors";
import Checkboxes from "./components/Checkboxes";
import { Dispatch, useState } from "react";
import LastToWash, {
  Position,
  positionToFloorPosition,
} from "./components/LastToWash";
import Holidays from "./components/Holidays";

function App() {
  let initialFloors: Map<Floor, Apartment> = new Map([
    ["P", { kind: "OneApartment", daysTotal: 1 }],
  ]);
  const [floors, setFloors] = useState(initialFloors);
  const [removeRowDisabled, setRemoveRowDisabled] = useState(true);
  const [year, setYear] = useState("");
  const [address, setAddress] = useState("");
  const [lastFloor, setLastFloor]: [Floor | null, Dispatch<any>] =
    useState(null);
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

  const lowestYear = 2020;
  const highestYear = 2050;

  const createLaundryPlan = async () => {
    if (lastPosition === "" || lastFloor === null) {
      throw "Position error";
    }
    const floorMap = new Map(
      Array.of(...floors).map(([floor, apartment]) => [
        floorToString(floor),
        apartmentToObject(apartment),
      ]),
    );

    const daysLeft = maxDays - lastDay;
    const apartmentInfo = {
      current_floor: floorToNum(lastFloor),
      position: positionToFloorPosition(lastPosition),
      days_left: daysLeft,
    };

    const holidayDatesStr: [String, String][] = holidayDates.map(
      ([date, name]) => {
        const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        return [dateStr, name];
      },
    );

    await invoke("create_laundry_plan", {
      config: { position_map: floorMap, title: address },
      year: Number(year),
      apartmentInfo: apartmentInfo,
      holidays: new Map(holidayDatesStr),
      excludeSunday: !sundayAllowed,
    });
  };

  const setCountryAndDivisions = async (newCountry: string) => {
    setCountry(newCountry);

    if (newCountry !== "") {
      const subdivisions: [string, string][] = await invoke(
        "get_subdivisions",
        {
          countryIso: newCountry,
        },
      );
      setRegionList(subdivisions);
    }
  };

  const getAndSetHolidaysFromWeb = async () => {
    const holidays: [string, String][] = await invoke("get_holidays", {
      year: Number(year),
      countryIso: country,
      subdivisionIso: region,
    });

    setHolidayDates((oldHolidays: [Date, String][]) => {
      const oldHolidayStr: [string, String][] = oldHolidays.map(
        ([date, name]) => [
          `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
          name,
        ],
      );
      const holidayMap = new Map(oldHolidayStr);
      holidays.forEach(([dateStr, holiday]) => {
        holidayMap.set(dateStr, holiday);
      });

      const newHolidays: [Date, String][] = Array.of(...holidayMap).map(
        ([dateStr, name]) => [new Date(dateStr), name],
      );

      return newHolidays;
    });
  };

  const canCreatePlan = () => {
    return (
      address !== "" &&
      year !== "" &&
      lastFloor &&
      lastPosition !== "" &&
      lastDay !== 0
    );
  };

  const mkHandleAdd = (floor: Floor) => {
    return () => {
      setFloors((oldFloors) => {
        const oldVal = oldFloors.get(floor);
        const newMap = new Map(oldFloors);
        return newMap.set(
          floor,
          addApartment(
            oldVal === undefined
              ? { kind: "OneApartment", daysTotal: 1 }
              : oldVal,
          ),
        );
      });
    };
  };

  const mkHandleRemove = (floor: Floor) => {
    return () => {
      setFloors((oldFloors) => {
        const oldVal = oldFloors.get(floor);
        const newMap = new Map(oldFloors);
        return newMap.set(
          floor,
          removeApartment(
            oldVal === undefined
              ? { kind: "OneApartment", daysTotal: 1 }
              : oldVal,
          ),
        );
      });
    };
  };

  const mkHandleSetDaysLeft = (floor: Floor) => {
    return (position: number, daysLeft: number) => {
      setFloors((oldFloors) => {
        const oldVal = oldFloors.get(floor);
        const apartment: Apartment =
          oldVal === undefined
            ? { kind: "OneApartment", daysTotal: 1 }
            : Object.assign({}, oldVal);
        const newFloors = new Map(oldFloors);
        return newFloors.set(floor, setDaysLeft(apartment, position, daysLeft));
      });
    };
  };

  const onRowAdded = () => {
    const [floor, apartment] = Array.from(floors)[floors.size - 1];
    const newFloor = nextFloor(floor);

    if (floors.size === 1) {
      setRemoveRowDisabled(false);
    }

    setFloors((oldFloors) => {
      const newFloors = new Map(oldFloors);
      return newFloors.set(newFloor, apartment);
    });
  };

  const onRowRemoved = () => {
    const floorArray = Array.from(floors);
    const [floor, _apartment] = floorArray[floorArray.length - 1];

    if (floors.size === 2) {
      setRemoveRowDisabled(true);
    }

    setFloors((oldFloors) => {
      const newFloors = new Map(oldFloors);
      newFloors.delete(floor);
      return newFloors;
    });
  };

  const onCheckHasParterre = (isChecked: boolean) => {
    setFloors((oldFloors) => {
      if (isChecked) {
        const newFloors = new Map(oldFloors);
        newFloors.delete("P");
        if (newFloors.size === 0) {
          newFloors.set(1, { kind: "OneApartment", daysTotal: 1 });
        }
        return newFloors;
      } else {
        const newFloors: Map<Floor, Apartment> = new Map([
          ["P", { kind: "OneApartment", daysTotal: 1 }],
        ]);
        oldFloors.forEach((apartment, floor) => {
          newFloors.set(floor, apartment);
        });

        if (newFloors.size > 1) {
          setRemoveRowDisabled(false);
        }
        return newFloors;
      }
    });
  };

  return (
    <main className="container">
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-four-fifths">
              <input
                className="input"
                type="text"
                placeholder="Adresse"
                value={address}
                onChange={(e) => {
                  const newAddress = e.target.value;
                  setAddress(newAddress);
                }}
              />
            </div>
            <div className="column is-one-fifth">
              <div className="select rounded is-fullwidth">
                <select
                  value={year}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setYear(newYear);
                  }}
                >
                  <option value="" disabled>
                    Jahr auswählen
                  </option>
                  {Array.from(
                    { length: highestYear - lowestYear + 1 },
                    (_value, index) => lowestYear + index,
                  ).map((value, index) => (
                    <option value={value} key={index}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="columns">
            <div className="column is-half" id="floors">
              <Floors
                floors={floors}
                mkHandleAdd={mkHandleAdd}
                mkHandleRemove={mkHandleRemove}
                mkHandleSetDaysLeft={mkHandleSetDaysLeft}
                onRowAdded={onRowAdded}
                onRowRemoved={onRowRemoved}
                removeRowDisabled={removeRowDisabled}
              />
            </div>
            <div className="column is-half">
              <Checkboxes
                onCheckHasParterre={onCheckHasParterre}
                sundayAllowed={sundayAllowed}
                toggleSundayAllowed={() => setSundayAllowed(!sundayAllowed)}
              />
              <LastToWash
                floors={floors}
                lastDay={lastDay}
                setLastDay={setLastDay}
                lastFloor={lastFloor}
                setLastFloor={setLastFloor}
                lastPosition={lastPosition}
                setLastPosition={setLastPosition}
                maxDays={maxDays}
                setMaxDays={setMaxDays}
              />
              <Holidays
                holidayDates={holidayDates}
                setHolidayDates={setHolidayDates}
                country={country}
                setCountry={setCountryAndDivisions}
                region={region}
                setRegion={setRegion}
                regionList={regionList}
                getAndSetHolidaysFromWeb={getAndSetHolidaysFromWeb}
                addingFromInternetEnabled={
                  year !== "" && country !== "" && region !== ""
                }
              />
            </div>
          </div>
          <div className="columns">
            <div className="column">
              <button
                className="button is-primary is-fullwidth"
                onClick={() => {
                  createLaundryPlan();
                }}
                disabled={!canCreatePlan()}
              >
                Plan erstellen
              </button>
            </div>
          </div>
        </div>
      </section>
      <script
        type="text/javascript"
        src="/src/assets/bulma-calendar.min.js"
      ></script>
    </main>
  );
}

export default App;
