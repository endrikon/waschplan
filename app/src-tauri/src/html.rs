use std::error::Error;
use std::fs::File;
use std::io::Write;

use crate::types::{self, DayHTMLData, YearMap};
use build_html::{self, Html, HtmlContainer, HtmlPage, Table, TableCell, TableCellType, TableRow};
use datetime::Month;

fn create_row(day_data: &DayHTMLData) -> TableRow {
    let day = TableCell::default().with_raw(day_data.date.clone());
    let date = TableCell::default().with_raw(day_data.day.clone());
    let appartment = TableCell::default().with_raw(day_data.appartment.clone());
    TableRow::new()
        .with_cell(day)
        .with_cell(date)
        .with_cell(appartment)
}

fn create_month_table(day_data: &[DayHTMLData]) -> Table {
    day_data.iter().fold(Table::new(), |table, day_data| {
        table.with_custom_body_row(create_row(day_data))
    })
}

fn create_month_row(row_data: &[(&i8, &Vec<DayHTMLData>)]) -> TableRow {
    assert!(row_data.len() == 3, "Wrong number of months");

    row_data.iter().fold(TableRow::new(), |row, (month, data)| {
        let current_month = Month::from_zero(**month).unwrap();
        row.with_cell(TableCell::new(TableCellType::Data).with_table(
            create_month_table(data).with_header_row(vec![types::month_to_string(current_month)]),
        ))
    })
}

pub fn create_year_html(config: &types::Config, year_map: &YearMap) -> Result<(), Box<dyn Error>> {
    let path = format!("{}.html", config.title);
    let mut output = File::create(path)?;
    let YearMap(map) = year_map;
    let mut month_data_vec: Vec<(&i8, &Vec<DayHTMLData>)> = map.iter().collect();
    month_data_vec.sort_by_key(|(y, _)| **y);
    let month_triples: Vec<Vec<(&i8, &Vec<DayHTMLData>)>> =
        month_data_vec.chunks(3).map(|x| x.to_vec()).collect();

    let table = month_triples.iter().fold(
        Table::new().with_caption(config.title.clone()),
        |table, triple| table.with_custom_body_row(create_month_row(triple)),
    );
    let page = HtmlPage::new()
        .with_title(config.title.clone())
        .with_table(table)
        .to_html_string();
    write!(output, "{}", page).map_err(|err| Box::new(err) as _)
}
