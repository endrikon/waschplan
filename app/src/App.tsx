// import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import "./assets/bulma.min.css"
import "./assets/bulma-calendar.min.css"
import Floors from "./components/Floors";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <main className="container">
    <section className="section">
      <div className="container">
        <div className="columns">
          <Floors />
          <div className="column is-half">
            <div className="columns">
              <div className="column is-full">
                <div className="checkboxes">
                  <label className="checkbox is-size-4">
                    <input type="checkbox" id="withParterre" checked onChange={() => {}} />
                    Parterre
                  </label>
                  <label className="checkbox is-size-4">
                    <input type="checkbox" id="sunday" />
                    Sonntag
                  </label>
                </div>
              </div>
            </div>
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
              <button className="button is-primary is-fullwidth" id="addHoliday">
                Feiertag hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <script type="text/javascript" src="/src/assets/bulma-calendar.min.js"></script>
    </main>
  );
}

export default App;
