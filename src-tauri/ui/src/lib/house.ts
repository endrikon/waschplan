const floors: any = document.querySelector("#floors");
const floorSelector: any = document.querySelector("#lastFloor");
const modifyRows: any = document.querySelector("#modifyRows");
const addRow: any = modifyRows.querySelector("#addRow");
const removeRow: any = modifyRows.querySelector("#removeRow");
const allowSunday = document.querySelector("#sunday");
const positionSelector: any = document.querySelector("#lastPosition");
const daySelector: any = document.querySelector("#lastLaundryDay");

function getPositionToClassMap(colNum: number) {
  switch (colNum) {
    case 1:
      return { 0: 'middle' };
    case 2:
      return {
        0: 'left',
        1: 'right'
      };
    case 3:
      return {
        0: 'left',
        1: 'middle',
        2: 'right'
      }
    // impossible
    default:
      return {};
  }
}

function addPositions(floorType: string) {
  switch (floorType) {
    case 'row-of-1':
      const opt1 = document.createElement('option');
      opt1.value = 'middle';
      opt1.innerText = 'Einzelzimmer';
      positionSelector.append(opt1);
      break;
    case 'row-of-2':
      const optLeft2 = document.createElement('option');
      optLeft2.value = 'left';
      optLeft2.innerText = 'Links';
      positionSelector.append(optLeft2);

      const optRight2 = document.createElement('option');
      optRight2.value = 'right';
      optRight2.innerText = 'Rechts';
      positionSelector.append(optRight2);
      break;

    case 'row-of-3':
      const optLeft3 = document.createElement('option');
      optLeft3.value = 'left';
      optLeft3.innerText = 'Links';
      positionSelector.append(optLeft3);

      const optMiddle3 = document.createElement('option');
      optMiddle3.value = 'middle';
      optMiddle3.innerText = 'Mitte';
      positionSelector.append(optMiddle3);

      const optRight3 = document.createElement('option');
      optRight3.value = 'right';
      optRight3.innerText = 'Rechts';
      positionSelector.append(optRight3);
      break;

    default:
      break;
  }
}

function adjustPositions() {
  const rowNum = floorSelector.value;
  const relevantRow: any = document.querySelector(`#floor-${rowNum}`);

  // don't do anything if it's the disabled field.
  if (rowNum !== "") {
    const regex = RegExp('row-of-');

    const classNames = relevantRow.className.split(' ');
    const apartmentsPerFloor = classNames.filter((item: any) => regex.test(item))[0];

    Array.from(positionSelector.children).slice(1).forEach((item: any) => item.remove());
    addPositions(apartmentsPerFloor)
  }
}

floorSelector.addEventListener('change', () => {
  adjustPositions()
  positionSelector.value = '';
  daySelector.value = '';
});

function removePositionIfSelected(rowNum: any) {
  const currentRow = floorSelector.value;
  if (rowNum === currentRow) {
    positionSelector.value = '';
    daySelector.value = '';
  }
}

function makeFloorSelector(row: string) {
  const opt = document.createElement('option');
  var rowNum = row;
  opt.value = rowNum;
  opt.innerText = row;
  return opt;
}

function makeRow(rowNum: string, colNum: number) {
  const selector = document.createElement('select')
  for (let i = 1; i < 4; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.innerText = String(i);
    selector.appendChild(opt);
  }

  const selectorDiv = document.createElement('div');
  selectorDiv.classList.add('select', 'rounded', 'is-fullwidth');
  selectorDiv.appendChild(selector);

  const emptyCol = document.createElement('div');
  emptyCol.classList.add('column', 'is-one-fifth');

  const selectorCol = emptyCol.cloneNode(true);
  selectorCol.appendChild(selectorDiv);

  const rowNumElement = document.createElement('p');
  rowNumElement.classList.add('has-text-centered', 'is-size-4');
  rowNumElement.innerText = rowNum.toString();

  const numCol = document.createElement('div');
  numCol.classList.add('column', 'is-1', 'has-text-centerd');
  numCol.appendChild(rowNumElement);

  const modifyColBtn: HTMLButtonElement = document.createElement('button');
  modifyColBtn.classList.add('button', 'is-fullwidth');

  const addColBtn: any  = modifyColBtn.cloneNode(true);
  addColBtn.classList.add('is-primary', 'addColBtn');
  addColBtn.innerText = '+';

  const removeColBtn: any = modifyColBtn.cloneNode(true);
  removeColBtn.classList.add('is-danger', 'removeColBtn');
  removeColBtn.innerText = '-';

  const addColColumn = document.createElement('div');
  addColColumn.classList.add('column');
  addColColumn.appendChild(addColBtn);

  const removeColColumn = document.createElement('div');
  removeColColumn.classList.add('column');
  removeColColumn.appendChild(removeColBtn);

  const row = document.createElement('div');
  row.classList.add('columns');
  row.id = `floor-${rowNum}`;
  row.appendChild(numCol);
  for (let i = 0; i < colNum; i++) {
    const classMap = getPositionToClassMap(colNum);
    const newSelectorCol: any = selectorCol.cloneNode(true);
    const selector = newSelectorCol.getElementsByTagName('select')[0];
    selector.classList.add(classMap[i]);
    row.appendChild(newSelectorCol);
  }

  // cleaner solution would be to add only one column
  // with the right size
  for (let i = colNum; i < 3; i++) {
    row.appendChild(emptyCol.cloneNode(true));
  }

  row.appendChild(addColColumn);
  row.appendChild(removeColColumn);
  row.classList.add(`row-of-${colNum}`);

  if (colNum === 1) {
    const removeBtn: any = row.querySelector('.removeColBtn');
    removeBtn.disabled = true;
  } else if (colNum === 3) {
    const addBtn: any = row.querySelector('.addColBtn');
    addBtn.disabled = true;
  }

  return row;
}

addRow.addEventListener('click', () => {
  const lastElement = modifyRows.previousElementSibling;
  var newElement: any = lastElement.cloneNode(true);
  var newRow: string;
  var row = newElement.firstElementChild.childNodes[0].textContent;
  if (row === 'P') {
    newRow = '1';
  } else {
    const rowNum = parseInt(row);
    newRow = `${rowNum + 1}`;
  }
  newElement.firstElementChild.childNodes[0].textContent = newRow;
  newElement.id = `floor-${newRow}`;

  lastElement.after(newElement);

  const newFloorOpt = makeFloorSelector(newRow);
  floorSelector.appendChild(newFloorOpt);

  enableDisableRemoveRows();
})

removeRow.addEventListener('click', () => {
  const lastElement = modifyRows.previousElementSibling;
  if (lastElement.previousElementSibling !== null) {
    lastElement.remove();
  }

  floorSelector.lastChild.remove();
  enableDisableRemoveRows();
})

// remove column from row
document.addEventListener('click', (e: any) => {
  const target = e.target.closest('.removeColBtn');
  if (target) {
    const btn = target.parentElement;
    const parent = btn.parentElement;

    const rowNum = parent.firstElementChild.childNodes[0].textContent;
    removePositionIfSelected(rowNum);

    if (parent.classList.contains('row-of-2')) {
      const newElement = makeRow(rowNum, 1);
      const removeBtn: any = newElement.querySelector('.removeColBtn');
      removeBtn.disabled = true;
      parent.replaceWith(newElement);
    }
    if (parent.classList.contains('row-of-3')) {
      const newElement = makeRow(rowNum, 2);
      parent.replaceWith(newElement);
    }
    adjustPositions()
  }
})

// add column to row
document.addEventListener('click', (e: any) => {
  const target = e.target.closest('.addColBtn');
  if (target) {
    const btn = target.parentElement;
    const parent = btn.parentElement;

    const rowNum = parent.firstElementChild.childNodes[0].textContent;
    removePositionIfSelected(rowNum);

    if (parent.classList.contains('row-of-2')) {
      const newElement = makeRow(rowNum, 3);
      const addBtn: any = newElement.querySelector('.addColBtn');
      addBtn.disabled = true;
      parent.replaceWith(newElement);
    }
    if (parent.classList.contains('row-of-1')) {
      const newElement = makeRow(rowNum, 2);
      parent.replaceWith(newElement);
    }
    adjustPositions()
  }
})

const parterreCheckbox: any = document.querySelector('#withParterre');
parterreCheckbox.addEventListener('click', (e: any) => {
  const checkBox: any = e.target;

  if (checkBox.checked) {

    floors.prepend(parterreRow);
    const newFloorOpt = makeFloorSelector('P');
    floorSelector.children[0].after(newFloorOpt);
    enableDisableRemoveRows();

  } else {

    if (floorSelector.value === 'P') {
      floorSelector.value = '';
      positionSelector.value = '';
      daySelector.value = '';
    }

    const parterreFloor = floors.firstElementChild;
    const parterreSibling = parterreFloor.nextElementSibling;
    floorSelector.children[1].remove();

    if (parterreSibling.id !== 'floor-1') {

      const floor1 = makeRow('1', 1);
      parterreFloor.replaceWith(floor1);

      const newFloorOpt = makeFloorSelector('1');
      floorSelector.children[0].after(newFloorOpt);
    } else {
      parterreFloor.remove();
    }
    enableDisableRemoveRows();
  }
  adjustPositions()
})

function enableDisableRemoveRows() {
  const newLastElement = modifyRows.previousElementSibling;
  if (newLastElement.previousElementSibling !== null) {
    removeRow.disabled = false;
  } else {
    removeRow.disabled = true;
  }
}

function adjustAndReturnDaySelector() {
  daySelector.value = '';

  const rowNum = floorSelector.value;
  const position = positionSelector.value;
  const relevantRow: any = document.querySelector(`#floor-${rowNum}`);
  const totalDaysSelector: any = relevantRow.querySelector(`.${position}`);

  Array.from(daySelector.children).slice(1).forEach((item: any) => item.remove());

  for (let i = 1; i <= parseInt(totalDaysSelector.value); i++) {
    const opt: any = document.createElement('option');
    opt.value = i;
    opt.innerText = i;
    daySelector.append(opt);
  }

  return totalDaysSelector;
}

var relevantDaySelector: any;

positionSelector.addEventListener('change', () => {
  if (relevantDaySelector) {
    relevantDaySelector.removeEventListener('change', adjustAndReturnDaySelector);
  }
  relevantDaySelector = adjustAndReturnDaySelector();

  relevantDaySelector.addEventListener('change', adjustAndReturnDaySelector);
});

const parterreRow = makeRow('P', 1);
modifyRows.before(parterreRow);
