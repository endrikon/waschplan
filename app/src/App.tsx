// import { invoke } from "@tauri-apps/api/core";
import "./assets/bulma.min.css";
import "./assets/bulma-calendar.min.css";
import {
  Floor,
  Apartment,
  removeApartment,
  addApartment,
  setDaysLeft,
  nextFloor,
} from "./components/Floors";
import Floors from "./components/Floors";
import Checkboxes from "./components/Checkboxes";
import { useEffect, useState } from "react";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }
  let initialFloors: Map<Floor, Apartment> = new Map([
    ["P", { kind: "OneApartment", daysTotal: 1 }],
  ]);
  const [floors, setFloors] = useState(initialFloors);
  const [removeRowDisabled, setRemoveRowDisabled] = useState(true);

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
            <Floors
              floors={floors}
              mkHandleAdd={mkHandleAdd}
              mkHandleRemove={mkHandleRemove}
              mkHandleSetDaysLeft={mkHandleSetDaysLeft}
              onRowAdded={onRowAdded}
              onRowRemoved={onRowRemoved}
              removeRowDisabled={removeRowDisabled}
            />
            <div className="column is-half">
              <Checkboxes onCheckHasParterre={onCheckHasParterre} />
              <div className="columns">
                <div className="column is-one-third">
                  <div className="select">
                    <select id="lastFloor" defaultValue={""}>
                      <option value="" disabled>
                        Stockwerk auswählen
                      </option>
                      <option value="P">P</option>
                    </select>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="select">
                    <select id="lastPosition" defaultValue={""}>
                      <option value="" disabled>
                        Position auswählen
                      </option>
                    </select>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="select">
                    <select id="lastLaundryDay" defaultValue={""}>
                      <option value="" disabled>
                        Waschtag auswählen
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="column is-size-3">
                <b>Feiertage</b>
              </div>
              <div id="holidayList"></div>
              <div className="columns">
                <div className="column">
                  <input type="date" id="datePicker" />
                </div>
                <div className="column">
                  <input
                    className="input"
                    id="holidayName"
                    type="text"
                    placeholder="Feiertag"
                  />
                </div>
              </div>
              <div className="column">
                <button
                  className="button is-primary is-fullwidth"
                  id="addHoliday"
                >
                  Feiertag hinzufügen
                </button>
              </div>
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
