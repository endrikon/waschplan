const invoke = window.__TAURI__.core.invoke;

const modifyRows = document.querySelector("#modifyRows");
const addRow = modifyRows.querySelector("#addRow");
const removeRow = modifyRows.querySelector("#removeRow");
const floors = document.querySelector("#floors");

makeRow = (rowNum, colNum) => {
  const selector = document.createElement('select')
  for (let i = 1; i < 4; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerText = i;
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

  const modifyColBtn = document.createElement('button');
  modifyColBtn.classList.add('button', 'is-fullwidth');

  const addColBtn = modifyColBtn.cloneNode(true);
  addColBtn.classList.add('is-primary', 'addColBtn');
  addColBtn.innerText = '+';

  const removeColBtn = modifyColBtn.cloneNode(true);
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
  row.appendChild(numCol);
  for (let i = 0; i < colNum; i++) {
    row.appendChild(selectorCol.cloneNode(true));
  }

  // cleaner solution would be to add only one column
  // with the right size
  for (let i = colNum; i < 3; i++) {
    row.appendChild(emptyCol.cloneNode(true));
  }

  row.appendChild(addColColumn);
  row.appendChild(removeColColumn);
  row.classList.add(`row-of-${colNum}`);

  return row;
}

const parterreRow = makeRow('P', 1);
const removeBtn = parterreRow.querySelector('.removeColBtn');
removeBtn.disabled = true;
modifyRows.before(parterreRow);

addRow.addEventListener('click', () => {
  const lastElement = modifyRows.previousElementSibling;
  var newElement = lastElement.cloneNode(true);
  var newRow;
  var row = newElement.firstElementChild.childNodes[0].textContent;
  if (row === 'P') {
    newRow = '1';
  } else {
    const rowNum = parseInt(row);
    newRow = rowNum + 1;
  }
  newElement.firstElementChild.childNodes[0].textContent = newRow;

  lastElement.after(newElement);

  enableDisableRemoveRows();
})

removeRow.addEventListener('click', () => {
  const lastElement = modifyRows.previousElementSibling;
  if (lastElement.previousElementSibling !== null) {
    lastElement.remove();
  }
  enableDisableRemoveRows();
})

// remove column from row
document.addEventListener('click', (e) => {
  const target = e.target.closest('.removeColBtn');
  if (target) {
    const btn = target.parentElement;
    const parent = btn.parentElement;
    if (parent.classList.contains('row-of-2')) {
      const rowNum = parent.firstElementChild.childNodes[0].textContent;
      const newElement = makeRow(rowNum, 1);
      const removeBtn = newElement.querySelector('.removeColBtn');
      removeBtn.disabled = true;
      parent.replaceWith(newElement);
    }
    if (parent.classList.contains('row-of-3')) {
      const rowNum = parent.firstElementChild.childNodes[0].textContent;
      const newElement = makeRow(rowNum, 2);
      parent.replaceWith(newElement);
    }
  }
})

// add column to row
document.addEventListener('click', (e) => {
  const target = e.target.closest('.addColBtn');
  if (target) {
    const btn = target.parentElement;
    const parent = btn.parentElement;
    if (parent.classList.contains('row-of-2')) {
      const rowNum = parent.firstElementChild.childNodes[0].textContent;
      const newElement = makeRow(rowNum, 3);
      const addBtn = newElement.querySelector('.addColBtn');
      addBtn.disabled = true;
      parent.replaceWith(newElement);
    }
    if (parent.classList.contains('row-of-1')) {
      const rowNum = parent.firstElementChild.childNodes[0].textContent;
      const newElement = makeRow(rowNum, 2);
      parent.replaceWith(newElement);
    }
  }
})

const parterreCheckbox = document.querySelector('#withParterre');
parterreCheckbox.addEventListener('click', (e) => {
  const checkBox = e.target;
  if (checkBox.checked) {
    floors.prepend(parterreRow);
  } else {
    const parterreFloor = floors.firstElementChild;
    parterreFloor.remove();
  }
  console.log(e.target);
})

enableDisableRemoveRows = () => {
  const newLastElement = modifyRows.previousElementSibling;
  if (newLastElement.previousElementSibling !== null) {
    removeRow.disabled = false;
  } else {
    removeRow.disabled = true;
  }
}
