import bulmaCalendar from "bulma-calendar";
import { Dispatch, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const DatePickerComponent = ({
  disabledDates,
  onDateSelect,
  enableAddingHoliday,
  disableAddingHoliday,
}: {
  disabledDates: [Date, String][];
  onDateSelect: (date: Date) => void;
  enableAddingHoliday: () => void;
  disableAddingHoliday: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<any>(null); // any b/c TS complains about missing `datePicker`

  useEffect(() => {
    if (inputRef.current && !calendarRef.current) {
      const calendars = bulmaCalendar.attach(inputRef.current, {
        dateFormat: "dd.MM.yyyy",
        weekStart: 1,
        lang: "de",
        disabledDates: disabledDates.map((value) => value[0]),
      });

      if (calendars && calendars[0]) {
        calendarRef.current = calendars[0];

        calendars[0].on("select", (datepicker: any) => {
          const dateText = datepicker.data.value().split(".");
          const date: Date = new Date(
            `${dateText[2]}-${dateText[1].padStart(2, "0")}-${dateText[0].padStart(2, "0")}T00:00:00`,
          );
          onDateSelect(date);
          enableAddingHoliday();
        });
      }
    }
  }, []); // Only initialize once

  // Update disabled dates
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.clear;
      calendarRef.current.datePicker.disabledDates = disabledDates.map(
        (value) => value[0],
      );
      calendarRef.current.clear();
      calendarRef.current.refresh();
      disableAddingHoliday();
    }
  }, [disabledDates]);

  return <input ref={inputRef} type="date" />;
};

interface HolidayParameters {
  date: Date;
  name: String;
  onDelete: () => void;
}

function Holiday({ date, name, onDelete }: HolidayParameters) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // counting starts at 0
  const year = date.getFullYear();
  const dateString = `${day}.${month}.${year}`;

  return (
    <div className="columns">
      <div className="column is-one-fifth">
        <button
          className="button is-danger is-one-fifth small"
          onClick={() => onDelete()}
        >
          x
        </button>
      </div>
      <div className="column is-size-4">{name}</div>
      <div className="column is-size-4">{dateString}</div>
    </div>
  );
}

interface AutomaticHolidaysParameters {
  country: string;
  setCountry: (country: string) => void;
  regionList: [string, string][];
  region: string;
  setRegion: (region: string) => void;
  getAndSetHolidaysFromWeb: () => void;
  addingEnabled: boolean;
}

function AutomaticHolidays({
  country,
  setCountry,
  regionList,
  region,
  setRegion,
  getAndSetHolidaysFromWeb,
  addingEnabled,
}: AutomaticHolidaysParameters) {
  return (
    <>
      <div className="columns">
        <div className="column is-half">
          <div className="select is-fullwidth">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setRegion("");
              }}
            >
              <option value="" disabled>
                Land auswählen
              </option>
              <option value="CH">Schweiz</option>
              <option value="AT">Österreich</option>
              <option value="DE">Deutschland</option>
            </select>
          </div>
        </div>
        <div className="column is-half">
          <div className="select is-fullwidth">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
              }}
            >
              <option value="" disabled>
                Region auswählen
              </option>
              {regionList.map(([regionName, regionCode], index) => (
                <option value={regionCode} key={index}>
                  {regionName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column is-fullwidth">
          <button
            className="button is-fullwidth is-primary"
            onClick={getAndSetHolidaysFromWeb}
            disabled={!addingEnabled}
          >
            Feiertage hinzufügen
          </button>
        </div>
      </div>
    </>
  );
}

interface ManualHolidaysParameters {
  holidayDates: [Date, String][];
  setHolidayDates: (holidays: [Date, String][]) => void;
}

type NullDate = Date | null;

function ManualHolidays({
  holidayDates,
  setHolidayDates,
}: ManualHolidaysParameters) {
  const [selectedDate, setSelectedDate]: [NullDate, Dispatch<any>] =
    useState(null);
  const [holidayName, setHolidayName]: [string, Dispatch<any>] = useState("");
  const [addHolidayEnabled, setAddHolidayEnabled]: [boolean, Dispatch<any>] =
    useState(false);

  return (
    <>
      <div className="columns">
        <div className="column">
          <DatePickerComponent
            disabledDates={holidayDates}
            onDateSelect={(date) => setSelectedDate(date)}
            enableAddingHoliday={() => setAddHolidayEnabled(true)}
            disableAddingHoliday={() => setAddHolidayEnabled(false)}
          />
        </div>
        <div className="column">
          <input
            className="input"
            id="holidayName"
            type="text"
            placeholder="Feiertag"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
          />
        </div>
      </div>
      <button
        className="button is-primary is-fullwidth"
        id="addHoliday"
        disabled={holidayName === "" || !addHolidayEnabled}
        onClick={() => {
          const newHolidays = Array.of(...holidayDates);
          if (selectedDate) {
            newHolidays.push([selectedDate, holidayName]);
          }
          const sortedHolidays = newHolidays.sort(
            ([a, _a]: [Date, String], [b, _b]: [Date, String]) => {
              return a > b ? 1 : -1;
            },
          );
          setHolidayDates(sortedHolidays);
          setHolidayName("");
        }}
      >
        Feiertag hinzufügen
      </button>
    </>
  );
}

interface HolidaysParameters {
  holidayDates: [Date, String][];
  setHolidayDates: (holidays: [Date, String][]) => void;
  country: string;
  setCountry: (country: string) => void;
  regionList: [string, string][];
  region: string;
  setRegion: (region: string) => void;
  getAndSetHolidaysFromWeb: () => void;
  addingFromInternetEnabled: boolean;
}

function Holidays({
  holidayDates,
  setHolidayDates,
  country,
  setCountry,
  regionList,
  region,
  setRegion,
  getAndSetHolidaysFromWeb,
  addingFromInternetEnabled,
}: HolidaysParameters) {
  const [manualInsertExpanded, setManualInsertExpanded] = useState(false);
  const [automaticInsertExpanded, setAutomaticInsertExpanded] = useState(false);

  return (
    <>
      <div className="columns">
        <div className="column is-size-3">
          <b>Feiertage</b>
        </div>
      </div>
      {holidayDates.map((holiday, index) => (
        <Holiday
          key={index}
          date={holiday[0]}
          name={holiday[1]}
          onDelete={() =>
            setHolidayDates(
              holidayDates.filter(([d, _]: [Date, String]) => d !== holiday[0]),
            )
          }
        />
      ))}
      <div className="columns mb-0">
        <div className="column is-fullwidth">
          <div
            onClick={() => setManualInsertExpanded(!manualInsertExpanded)}
            className="is-fullwidth pb-2"
            style={{
              display: "flex",
              justifyContent: "space-between",
              cursor: "default",
            }}
          >
            <span className="is-size-4">Feiertag manuell eingeben</span>
            {manualInsertExpanded ? (
              <ChevronDown className="has-text-link float-right" />
            ) : (
              <ChevronRight className="has-text-link float-right" />
            )}
          </div>
          {manualInsertExpanded && (
            <ManualHolidays
              holidayDates={holidayDates}
              setHolidayDates={setHolidayDates}
            />
          )}
        </div>
      </div>
      <div className="columns">
        <div className="column is-fullwidth">
          <div
            onClick={() => {
              setAutomaticInsertExpanded(!automaticInsertExpanded);
              if (!automaticInsertExpanded) {
                setCountry("");
                setRegion("");
              }
            }}
            className="is-fullwidth pb-2"
            style={{
              display: "flex",
              justifyContent: "space-between",
              cursor: "default",
            }}
          >
            <span className="is-size-4">Feiertage automatisch einfügen</span>
            {automaticInsertExpanded ? (
              <ChevronDown className="has-text-link float-right" />
            ) : (
              <ChevronRight className="has-text-link float-right" />
            )}
          </div>
          {automaticInsertExpanded && (
            <AutomaticHolidays
              country={country}
              setCountry={setCountry}
              regionList={regionList}
              region={region}
              setRegion={setRegion}
              getAndSetHolidaysFromWeb={getAndSetHolidaysFromWeb}
              addingEnabled={addingFromInternetEnabled}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Holidays;
