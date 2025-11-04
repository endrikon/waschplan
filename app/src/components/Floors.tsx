import { useState } from "react";

type Floor = number | "P";

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

type Apartment = OneApartment | TwoApartments | ThreeApartments;

interface FloorProps {
  row: Floor;
  apartment?: Apartment;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onDaysAndPositionSelected: (position: number, daysLeft: number) => void;
}

interface FloorSelectorProps {
  onDaysSelected: (daysLeft: number) => void;
}

function FloorSelector({ onDaysSelected }: FloorSelectorProps) {
  return (
    <div className="column is-one-fifth">
      <div className="select rounded is-fullwidth">
        <select onChange={(e) => onDaysSelected(Number(e.target.value))}>
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

function FloorsRow({
  apartment,
  row,
  onAddColumn,
  onRemoveColumn,
  onDaysAndPositionSelected,
}: FloorProps) {
  const defaultFloorApartments = apartment
    ? getNumberOfApartments(apartment)
    : 1;
  const defaultAddDisabled = apartment ? isAddDisabled(apartment) : false;
  const defaultRemoveDisabled = apartment ? isRemoveDisabled(apartment) : true;

  const floorApartments = defaultFloorApartments;
  const addDisabled = defaultAddDisabled;
  const removeDisabled = defaultRemoveDisabled;
  // const [floorApartments, setFloorApartments] = useState(defaultFloorApartments);
  // const [addDisabled, setAddDisabled] = useState(defaultAddDisabled);
  // const [removeDisabled, setRemoveDisabled] = useState(defaultRemoveDisabled);

  const handleClickAdd = () => {
    onAddColumn();
    // setFloorApartments(floorApartments + 1);

    // setRemoveDisabled(false);
    // if (floorApartments === 2) {
    //   setAddDisabled(true);
    // }
  };
  const handleClickRemove = () => {
    onRemoveColumn();
    // setFloorApartments(floorApartments - 1);

    // setAddDisabled(false);
    // if (floorApartments === 2) {
    //   setRemoveDisabled(true);
    // }
  };

  return (
    <div className="columns">
      <div className="column is-1 has-text-centered">
        <p className="has-text-centerd">{row}</p>
      </div>
      {[...Array(floorApartments)].map((_, index) => (
        <FloorSelector
          onDaysSelected={(daysLeft: number) =>
            onDaysAndPositionSelected(index, daysLeft)
          }
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
          onClick={handleClickAdd}
        >
          +
        </button>
      </div>
      <div className="column">
        <button
          className="button is-danger is-fullwidth"
          id="removeRow"
          disabled={removeDisabled}
          onClick={handleClickRemove}
        >
          -
        </button>
      </div>
    </div>
  );
}

// NOTE: Simply returns the given apartment if the position is out of bounds.
function setDaysLeft(
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

function addApartment(apartment: Apartment): Apartment {
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

function removeApartment(apartment: Apartment): Apartment {
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

function nextFloor(floor: Floor): Floor {
  if (floor === "P") {
    return 1;
  } else {
    return floor + 1;
  }
}

function Floors() {
  let initialFloors: Map<Floor, Apartment> = new Map([
    ["P", { kind: "OneApartment", daysTotal: 1 }],
  ]);
  const [floors, setFloors] = useState(initialFloors);

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
            : oldVal;
        return oldFloors.set(floor, setDaysLeft(apartment, position, daysLeft));
      });
    };
  };

  const onRowAdded = () => {
    const [floor, apartment] = Array.from(floors)[floors.size - 1];
    const newFloor = nextFloor(floor);
    setFloors((oldFloors) => new Map(oldFloors.set(newFloor, apartment)));
  };

  const onRowRemoved = () => {
    const [floor, apartment] = Array.from(floors)[floors.size - 1];
    setFloors((oldFloors) => {
      oldFloors.delete(floor);
      return new Map(oldFloors);
    });
  };

  return (
    <div className="column is-half" id="floors">
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
            disabled={false}
            onClick={onRowRemoved}
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}

export default Floors;
