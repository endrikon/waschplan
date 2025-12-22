export type Floor = number | "P";

interface OneApartment {
  kind: "OneApartment";
  daysTotal: number;
}

interface TwoApartments {
  kind: "TwoApartments";
  leftDaysTotal: number;
  rightDaysTotal: number;
}

interface ThreeApartments {
  kind: "ThreeApartments";
  leftDaysTotal: number;
  middleDaysTotal: number;
  rightDaysTotal: number;
}

export type Apartment = OneApartment | TwoApartments | ThreeApartments;

type RustOneApartment = {
  OneApartment: {
    days_total: number;
  };
};

type RustTwoApartments = {
  TwoApartments: {
    left_days_total: number;
    right_days_total: number;
  };
};

type RustThreeApartments = {
  ThreeApartments: {
    left_days_total: number;
    middle_days_total: number;
    right_days_total: number;
  };
};

export type RustApartment =
  | RustOneApartment
  | RustTwoApartments
  | RustThreeApartments;

interface FloorProps {
  row: Floor;
  apartment: Apartment;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onDaysAndPositionSelected: (position: number, daysLeft: number) => void;
}

interface FloorSelectorProps {
  onDaysSelected: (daysLeft: number) => void;
  daysLeft: number;
}

export function floorToString(floor: Floor): String {
  switch (floor) {
    case "P":
      return "0";
    default:
      return floor.toString();
  }
}

export function floorToNum(floor: Floor): Number {
  switch (floor) {
    case "P":
      return 0;
    default:
      return floor;
  }
}

export function stringNumToFloor(floorStr: string): Floor {
  if (floorStr === "0") {
    return "P";
  } else {
    return Number(floorStr);
  }
}

export function apartmentToRustApartment(apartment: Apartment): RustApartment {
  switch (apartment.kind) {
    case "OneApartment":
      return {
        OneApartment: {
          days_total: apartment.daysTotal,
        },
      };
    case "TwoApartments":
      return {
        TwoApartments: {
          left_days_total: apartment.leftDaysTotal,
          right_days_total: apartment.rightDaysTotal,
        },
      };
    case "ThreeApartments":
      return {
        ThreeApartments: {
          left_days_total: apartment.leftDaysTotal,
          middle_days_total: apartment.middleDaysTotal,
          right_days_total: apartment.rightDaysTotal,
        },
      };
  }
}

export function rustApartmentToApartment(
  rustApartment: RustApartment,
): Apartment {
  if ("OneApartment" in rustApartment) {
    return {
      kind: "OneApartment",
      daysTotal: rustApartment.OneApartment.days_total,
    };
  } else if ("TwoApartments" in rustApartment) {
    return {
      kind: "TwoApartments",
      leftDaysTotal: rustApartment.TwoApartments.left_days_total,
      rightDaysTotal: rustApartment.TwoApartments.right_days_total,
    };
  } else {
    return {
      kind: "ThreeApartments",
      leftDaysTotal: rustApartment.ThreeApartments.left_days_total,
      middleDaysTotal: rustApartment.ThreeApartments.middle_days_total,
      rightDaysTotal: rustApartment.ThreeApartments.right_days_total,
    };
  }
}

function FloorSelector({ onDaysSelected, daysLeft }: FloorSelectorProps) {
  return (
    <div className="column is-one-fifth">
      <div className="select rounded is-fullwidth">
        <select
          onChange={(e) => onDaysSelected(Number(e.target.value))}
          value={daysLeft}
        >
          {[...Array(3).keys()].map((num) => {
            const value = num + 1;
            return (
              <option value={value} key={value}>
                {value}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

function EmptyBlock() {
  return <div className="column is-one-fifth"></div>;
}

function getNumberOfApartments(apartment: Apartment): number {
  switch (apartment.kind) {
    case "OneApartment":
      return 1;
    case "TwoApartments":
      return 2;
    case "ThreeApartments":
      return 3;
  }
}

function isAddDisabled(apartment: Apartment): boolean {
  switch (apartment.kind) {
    case "OneApartment":
      return false;
    case "TwoApartments":
      return false;
    case "ThreeApartments":
      return true;
  }
}

function isRemoveDisabled(apartment: Apartment): boolean {
  switch (apartment.kind) {
    case "OneApartment":
      return true;
    case "TwoApartments":
      return false;
    case "ThreeApartments":
      return false;
  }
}

function getDaysLeft(apartment: Apartment): number[] {
  switch (apartment.kind) {
    case "OneApartment":
      return [apartment.daysTotal];
    case "TwoApartments":
      return [apartment.leftDaysTotal, apartment.rightDaysTotal];
    case "ThreeApartments":
      return [
        apartment.leftDaysTotal,
        apartment.middleDaysTotal,
        apartment.rightDaysTotal,
      ];
  }
}

function FloorsRow({
  apartment,
  row,
  onAddColumn,
  onRemoveColumn,
  onDaysAndPositionSelected,
}: FloorProps) {
  const floorApartments = getNumberOfApartments(apartment);
  const addDisabled = isAddDisabled(apartment);
  const removeDisabled = isRemoveDisabled(apartment);
  const daysLeftList = getDaysLeft(apartment);

  return (
    <div className="columns">
      <div className="column is-1 has-text-centered">
        <p className="has-text-centerd">{row}</p>
      </div>
      {[...daysLeftList].map((daysLeft, index) => (
        <FloorSelector
          onDaysSelected={(daysLeft: number) =>
            onDaysAndPositionSelected(index, daysLeft)
          }
          daysLeft={daysLeft}
          key={index}
        />
      ))}
      {[...Array(3 - floorApartments)].map((_, index) => (
        <EmptyBlock key={index} />
      ))}
      <div className="column">
        <button
          className="button is-primary is-fullwidth"
          id="addRow"
          disabled={addDisabled}
          onClick={onAddColumn}
        >
          +
        </button>
      </div>
      <div className="column">
        <button
          className="button is-danger is-fullwidth"
          id="removeRow"
          disabled={removeDisabled}
          onClick={onRemoveColumn}
        >
          -
        </button>
      </div>
    </div>
  );
}

// NOTE: Simply returns the given apartment if the position is out of bounds.
export function setDaysLeft(
  apartment: Apartment,
  position: number,
  daysLeft: number,
): Apartment {
  switch (apartment.kind) {
    case "OneApartment":
      apartment.daysTotal = daysLeft;
      break;
    case "TwoApartments":
      switch (position) {
        case 0:
          apartment.leftDaysTotal = daysLeft;
          break;
        case 1:
          apartment.rightDaysTotal = daysLeft;
          break;
      }
      break;
    case "ThreeApartments":
      switch (position) {
        case 0:
          apartment.leftDaysTotal = daysLeft;
          break;
        case 1:
          apartment.middleDaysTotal = daysLeft;
          break;
        case 2:
          apartment.rightDaysTotal = daysLeft;
          break;
      }
      break;
    default:
      break;
  }
  return apartment;
}

export function addApartment(apartment: Apartment): Apartment {
  switch (apartment.kind) {
    case "OneApartment":
      return {
        kind: "TwoApartments",
        leftDaysTotal: apartment.daysTotal,
        rightDaysTotal: 1,
      };
    case "TwoApartments":
      return {
        kind: "ThreeApartments",
        leftDaysTotal: apartment.leftDaysTotal,
        middleDaysTotal: apartment.rightDaysTotal,
        rightDaysTotal: 1,
      };
    case "ThreeApartments":
      return apartment;
  }
}

export function removeApartment(apartment: Apartment): Apartment {
  switch (apartment.kind) {
    case "OneApartment":
      return apartment;
    case "TwoApartments":
      return { kind: "OneApartment", daysTotal: apartment.leftDaysTotal };
    case "ThreeApartments":
      return {
        kind: "TwoApartments",
        leftDaysTotal: apartment.leftDaysTotal,
        rightDaysTotal: apartment.middleDaysTotal,
      };
  }
}

export function nextFloor(floor: Floor): Floor {
  if (floor === "P") {
    return 1;
  } else {
    return floor + 1;
  }
}

interface FloorsProperties {
  floors: Map<Floor, Apartment>;
  mkHandleAdd: (floor: Floor) => () => void;
  mkHandleRemove: (floor: Floor) => () => void;
  mkHandleSetDaysLeft: (
    floor: Floor,
  ) => (position: number, daysLeft: number) => void;
  onRowAdded: () => void;
  onRowRemoved: () => void;
  removeRowDisabled: boolean;
}

function Floors({
  floors,
  mkHandleAdd,
  mkHandleRemove,
  mkHandleSetDaysLeft,
  onRowAdded,
  onRowRemoved,
  removeRowDisabled,
}: FloorsProperties) {
  return (
    <>
      {Array.from(floors).map(([floor, apartment], index) => (
        <FloorsRow
          row={floor}
          apartment={apartment}
          onAddColumn={mkHandleAdd(floor)}
          onRemoveColumn={mkHandleRemove(floor)}
          onDaysAndPositionSelected={mkHandleSetDaysLeft(floor)}
          key={index}
        />
      ))}
      <div className="columns" id="modifyRows">
        <div className="column is-half">
          <button
            className="button is-primary is-fullwidth"
            id="addRow"
            onClick={onRowAdded}
          >
            +
          </button>
        </div>
        <div className="column is-half">
          <button
            className="button is-danger is-fullwidth"
            id="removeRow"
            disabled={removeRowDisabled}
            onClick={onRowRemoved}
          >
            -
          </button>
        </div>
      </div>
    </>
  );
}

export default Floors;
