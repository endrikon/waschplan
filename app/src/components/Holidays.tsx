import bulmaCalendar from "bulma-calendar";
import { Dispatch, useEffect, useRef, useState } from "react";

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

type NullDate = Date | null;

function Holidays() {
  const [holidayDates, setHolidayDates]: [[Date, String][], Dispatch<any>] =
    useState([]);
  const [selectedDate, setSelectedDate]: [NullDate, Dispatch<any>] =
    useState(null);
  const [holidayName, setHolidayName]: [string, Dispatch<any>] = useState("");
  const [addHolidayEnabled, setAddHolidayEnabled]: [boolean, Dispatch<any>] =
    useState(false);

  return (
    <>
      <div className="column is-size-3">
        <b>Feiertage</b>
      </div>
      {holidayDates.map((holiday, index) => (
        <Holiday
          key={index}
          date={holiday[0]}
          name={holiday[1]}
          onDelete={() =>
            setHolidayDates((holidays: [Date, String][]) =>
              holidays.filter(([d, _]: [Date, String]) => d !== holiday[0]),
            )
          }
        />
      ))}
      <div id="holidayList"></div>
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
      <div className="column">
        <button
          className="button is-primary is-fullwidth"
          id="addHoliday"
          disabled={holidayName === "" || !addHolidayEnabled}
          onClick={() => {
            setHolidayDates((holidays: [Date, String][]) => {
              const newHolidays = Array.of(...holidays);
              if (selectedDate) {
                newHolidays.push([selectedDate, holidayName]);
              }
              return newHolidays.sort(
                ([a, _a]: [Date, String], [b, _b]: [Date, String]) => {
                  return a > b ? 1 : -1;
                },
              );
            });
            setHolidayName("");
          }}
        >
          Feiertag hinzufügen
        </button>
      </div>
    </>
  );
}

export default Holidays;
