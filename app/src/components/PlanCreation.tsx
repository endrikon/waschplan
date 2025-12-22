import { invoke } from "@tauri-apps/api/core";
import "../assets/bulma.min.css";
import "../assets/bulma-calendar.min.css";
import {
  Floor,
  Apartment,
  removeApartment,
  addApartment,
  setDaysLeft,
  nextFloor,
  apartmentToRustApartment,
  floorToString,
  floorToNum,
  RustApartment,
  rustApartmentToApartment,
  stringNumToFloor,
} from "./Floors";
import Floors from "./Floors";
import Checkboxes from "./Checkboxes";
import { Dispatch } from "react";
import LastToWash, { Position, positionToFloorPosition } from "./LastToWash";
import Holidays from "./Holidays";
import Navbar from "./Navbar";

interface PlanCreationParameters {
  setPreview: (preview: string) => void;
  floors: Map<Floor, Apartment>;
  setFloors: Dispatch<any>;
  removeRowDisabled: boolean;
  setRemoveRowDisabled: (removeRowDisabled: boolean) => void;
  year: string;
  setYear: (year: string) => void;
  address: string;
  setAddress: (address: string) => void;
  lastFloor: Floor | "";
  setLastFloor: (lastFloor: Floor | "") => void;
  lastPosition: Position | "";
  setLastPosition: (lastPosition: Position | "") => void;
  lastDay: number;
  setLastDay: Dispatch<any>;
  maxDays: number;
  setMaxDays: Dispatch<any>;
  holidayDates: [Date, String][];
  setHolidayDates: Dispatch<any>;
  sundayAllowed: boolean;
  setSundayAllowed: (sundayAllowed: boolean) => void;
  country: string;
  setCountry: (country: string) => void;
  region: string;
  setRegion: (region: string) => void;
  regionList: [string, string][];
  setRegionList: (regionList: [string, string][]) => void;
  lastApartment: Apartment | undefined;
  setLastApartment: Dispatch<any>;
}

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

async function invokeResult<T>(
  command: string,
  args?: any,
): Promise<Result<T, string>> {
  try {
    const value = await invoke<T>(command, args);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as string };
  }
}

interface RustConfig {
  position_map: Map<String, RustApartment>;
  title: String;
}

function mkRustConfig(
  floors: Map<Floor, Apartment>,
  address: String,
): RustConfig {
  const floorMap = new Map(
    Array.of(...floors).map(([floor, apartment]) => [
      floorToString(floor),
      apartmentToRustApartment(apartment),
    ]),
  );

  return { position_map: floorMap, title: address };
}

interface Config {
  floors: Map<Floor, Apartment>;
  address: string;
}

function mkConfig(rustCfg: RustConfig): Config {
  console.log(rustCfg);
  const floorMap = new Map(
    Array.of(...Object.entries(rustCfg.position_map)).map(
      ([floor, apartment]) => [
        stringNumToFloor(floor.toString()),
        rustApartmentToApartment(apartment),
      ],
    ),
  );

  return { floors: floorMap, address: rustCfg.title.toString() };
}

function PlanCreation({
  setPreview,
  floors,
  setFloors,
  removeRowDisabled,
  setRemoveRowDisabled,
  year,
  setYear,
  address,
  setAddress,
  lastFloor,
  setLastFloor,
  lastPosition,
  setLastPosition,
  lastDay,
  setLastDay,
  maxDays,
  setMaxDays,
  holidayDates,
  setHolidayDates,
  sundayAllowed,
  setSundayAllowed,
  country,
  setCountry,
  region,
  setRegion,
  regionList,
  setRegionList,
  lastApartment,
  setLastApartment,
}: PlanCreationParameters) {
  const lowestYear = 2020;
  const highestYear = 2050;

  const createLaundryPlan = async () => {
    if (lastPosition === "" || lastFloor === "") {
      throw "Position error";
    }
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

    const preview: string = await invoke("create_laundry_plan", {
      config: mkRustConfig(floors, address),
      year: Number(year),
      apartmentInfo: apartmentInfo,
      holidays: new Map(holidayDatesStr),
      excludeSunday: !sundayAllowed,
    });

    return preview;
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

  const onSave = async () => {
    const config = mkRustConfig(floors, address);

    await invoke("save_config", { config: config });
  };

  const onLoad = async () => {
    const rustConfigResult: Result<RustConfig, String> =
      await invokeResult("read_config");

    if (rustConfigResult.ok) {
      const config = mkConfig(rustConfigResult.value);
      setAddress(config.address);
      setFloors(config.floors);
    } else {
      if (rustConfigResult.error !== "No path given.") {
        alert(`Ungültige Konfiguration: ${rustConfigResult.error}`);
      }
    }
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
      setFloors((oldFloors: Map<Floor, Apartment>) => {
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
      setFloors((oldFloors: Map<Floor, Apartment>) => {
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
      setFloors((oldFloors: Map<Floor, Apartment>) => {
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

    setFloors((oldFloors: Map<Floor, Apartment>) => {
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

    setFloors((oldFloors: Map<Floor, Apartment>) => {
      const newFloors = new Map(oldFloors);
      newFloors.delete(floor);
      return newFloors;
    });
  };

  const onCheckHasParterre = (isChecked: boolean) => {
    setFloors((oldFloors: Map<Floor, Apartment>) => {
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
      <Navbar onSave={onSave} onLoad={onLoad} />
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
                lastApartment={lastApartment}
                setLastApartment={setLastApartment}
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
                className="button is-link is-fullwidth"
                onClick={() => {
                  createLaundryPlan().then((preview: string) =>
                    setPreview(preview),
                  );
                }}
                disabled={!canCreatePlan()}
              >
                Vorschau erstellen
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

export default PlanCreation;
