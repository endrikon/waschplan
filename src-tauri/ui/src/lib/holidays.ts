const datePicker: any = document.querySelector("#datePicker");
const addHoliday: any = document.querySelector("#addHoliday");
const holidayName: any = document.querySelector("#holidayName");
const holidayList: any = document.querySelector("#holidayList");

addHoliday.disabled = true;

// Initialize all input of type date
var calendars = bulmaCalendar.attach('[type="date"]',
  {
    dateFormat: 'dd.MM.yyyy',
    weekStart: 1,
    lang: 'de',
    disabledDates: [],
  });

function makeHoliday(name: string, date: string) {
  const columns = document.createElement('div');
  columns.classList.add('columns');

  const removeCol = document.createElement('div')
  removeCol.classList.add('column', 'is-one-fifth')
  const removeBtn = document.createElement('button');
  removeBtn.classList.add("button", "is-danger", "is-one-fifth", "small", "removeHoliday");
  removeBtn.innerText = "x";
  removeCol.appendChild(removeBtn);

  const holidayNameCol = document.createElement('div')
  holidayNameCol.classList.add('column', 'is-size-4')
  holidayNameCol.innerText = name;

  const holidayDateCol = document.createElement('div')
  holidayDateCol.classList.add('column', 'is-size-4')
  holidayDateCol.innerText = date;

  columns.appendChild(removeCol);
  columns.appendChild(holidayDateCol);
  columns.appendChild(holidayNameCol);

  return columns;
}

addHoliday.addEventListener('click', () => {
  const date = datePicker.bulmaCalendar.datePicker.date.start;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // counting starts at 0
  const year = date.getFullYear();
  const dateString = `${day}.${month}.${year}`;
  const dateObj = makeDate(year, month, day);
  const holidayNameString = holidayName.value;

  holidayName.value = '';
  datePicker.bulmaCalendar.datePicker.disabledDates.push(dateObj);
  datePicker.bulmaCalendar.clear();

  addHoliday.disabled = true;

  const holidayRow = makeHoliday(holidayNameString, dateString);
  holidayList.appendChild(holidayRow);

  [...holidayList.children]
    .sort((a: any, b: any) => {
      const date1 = a.childNodes[1].innerText.split('.');
      const date2 = b.childNodes[1].innerText.split('.');
      const dateObj1 = makeDate(date1[2], date1[1], date1[0]);
      const dateObj2 = makeDate(date2[2], date2[1], date2[0]);

      return (dateObj1 > dateObj2 ? 1 : -1);
    })
    .forEach(node => holidayList.appendChild(node));
});

const calendar = calendars[0];
calendar.on('select', () => {
  if (hasHolidayData()) {
    addHoliday.disabled = false;
  }
});

const dateDeleteBtn: any = document.querySelector('.datetimepicker-clear-button');
dateDeleteBtn.addEventListener('click', () => {
  addHoliday.disabled = true;
})

holidayName.addEventListener('change', () => {
  if (hasHolidayData()) {
    addHoliday.disabled = false;
  } else {
    addHoliday.disabled = true;
  }
})

function hasHolidayData() {
  return datePicker.bulmaCalendar.datePicker.date.start !== undefined
    && holidayName.value !== '';
}

function makeDate(year: number, month: string, day: string) {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
}

// remove holiday from list
document.addEventListener('click', (e: any) => {
  const target = e.target.closest('.removeHoliday');
  if (target) {
    const btn = target.parentElement;
    const parent = btn.parentElement;
    const date = parent.childNodes[1].innerText.split('.');
    const dateObj =
      `${String(date[0]).padStart(2, '0')}/${String(date[1]).padStart(2, '0')}/${date[2]}`;

    datePicker.bulmaCalendar.datePicker.disabledDates =
      datePicker.bulmaCalendar.datePicker.disabledDates.filter((d: any) => d.toLocaleDateString() !== dateObj);
    parent.remove();
  }
});
