import { Dispatch, useEffect } from "react";
import { Floor, Apartment } from "./Floors";

interface LastToWashProperties {
  floors: Map<Floor, Apartment>;
  lastFloor: Floor | "";
  setLastFloor: (floor: Floor | "") => void;
  lastPosition: "" | Position;
  setLastPosition: (position: "" | Position) => void;
  lastDay: Number;
  setLastDay: (lastDay: Number) => void;
  maxDays: Number;
  setMaxDays: (maxDays: Number) => void;
  lastApartment: Apartment | undefined;
  setLastApartment: Dispatch<any>;
}

export interface ApartmentInfo {
  currentFloor: Number;
  position: FloorPosition;
  daysLeft: Number;
}

export type FloorPosition = "Left" | "Middle" | "Right";

export type Position = "Links" | "Mitte" | "Rechts" | "EinzelWohnung";

export function positionToFloorPosition(position: Position): FloorPosition {
  switch (position) {
    case "Links":
      return "Left";
    case "Mitte":
      return "Middle";
    case "Rechts":
      return "Right";
    case "EinzelWohnung":
      return "Middle";
  }
}

function stringToPosition(positionStr: string): Position {
  switch (positionStr) {
    case "Links":
      return "Links";
    case "Mitte":
      return "Mitte";
    case "Rechts":
      return "Rechts";
    case "EinzelWohnung":
      return "EinzelWohnung";
    // should never happen
    default:
      return "EinzelWohnung";
  }
}

function getDays(apartment: Apartment | undefined, position: Position): number {
  if (apartment === undefined) {
    return 0;
  }
  switch (apartment.kind) {
    case "OneApartment":
      if (position === "EinzelWohnung") {
        return apartment.daysTotal;
      } else {
        return 0;
      }
    case "TwoApartments":
      switch (position) {
        case "Links":
          return apartment.leftDaysTotal;
        case "Rechts":
          return apartment.rightDaysTotal;
        default:
          return 0;
      }
    case "ThreeApartments":
      switch (position) {
        case "Links":
          return apartment.leftDaysTotal;
        case "Mitte":
          return apartment.middleDaysTotal;
        case "Rechts":
          return apartment.rightDaysTotal;
        default:
          return 0;
      }
  }
}

function getPositions(apartment: Apartment | undefined): string[] {
  if (apartment === undefined) {
    return [];
  }
  switch (apartment.kind) {
    case "OneApartment":
      return ["Einzelwohnung"];
    case "TwoApartments":
      return ["Links", "Rechts"];
    case "ThreeApartments":
      return ["Links", "Mitte", "Rechts"];
  }
}

function stringToFloor(floorStr: string): Floor {
  if (floorStr === "P") {
    return floorStr;
  } else {
    return Number(floorStr);
  }
}

function LastToWash({
  floors,
  lastDay,
  setLastDay,
  lastFloor,
  setLastFloor,
  lastPosition,
  setLastPosition,
  maxDays,
  setMaxDays,
  lastApartment,
  setLastApartment,
}: LastToWashProperties) {
  useEffect(() => {
    console.log("DEBUG");
    if (lastFloor !== "") {
      const relevantApartment = floors.get(lastFloor);

      if (relevantApartment === undefined) {
        setLastFloor("");
      }

      if (relevantApartment !== lastApartment) {
        setLastApartment(relevantApartment);
        setLastPosition("");
        setLastDay(0);
      }
    }
  }, [floors]);

  return (
    <div className="columns">
      <div className="column is-one-third">
        <div className="select">
          <select
            id="lastFloor"
            value={lastFloor}
            onChange={(e) => {
              const selectedFloorStr = e.target.value;
              const selectedFloor = stringToFloor(selectedFloorStr);
              setLastFloor(selectedFloor);
              setLastApartment(floors.get(selectedFloor));

              // reset apartment and day selector
              setLastPosition("");
              setLastDay(0);
            }}
          >
            <option value="" disabled>
              Stockwerk auswählen
            </option>
            {Array.from(floors).map(([floor, _apartment], index) => (
              <option key={index} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="column is-one-third">
        <div className="select">
          <select
            id="lastPosition"
            value={lastPosition}
            onChange={(e) => {
              const lastPosition = e.target.value;
              const position = stringToPosition(lastPosition);
              setLastPosition(position);
              const days: number = getDays(lastApartment, position);
              setMaxDays(days);
            }}
          >
            <option value="" disabled>
              Position auswählen
            </option>
            {getPositions(lastApartment).map((position, index) => (
              <option key={index}> {position} </option>
            ))}
          </select>
        </div>
      </div>
      <div className="column is-one-third">
        <div className="select">
          <select
            id="lastLaundryDay"
            value={lastDay.toString()}
            onChange={(e) => {
              const value = Number(e.target.value);
              setLastDay(value);
            }}
          >
            <option value="0" disabled>
              Waschtag auswählen
            </option>
            {[...Array(maxDays).keys()].map((value, index) => (
              <option value={value + 1} key={index}>
                {value + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default LastToWash;
