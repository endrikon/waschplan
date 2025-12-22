use crate::types::{self, DayHTMLData, YearMap};
use build_html::{
    self, Html, HtmlContainer, HtmlElement, HtmlPage, Table, TableCell, TableCellType, TableRow,
};
use datetime::Month;

fn create_row(day_data: &DayHTMLData) -> TableRow {
    let date = TableCell::default().with_raw(day_data.date.clone());
    let day = TableCell::default().with_raw(day_data.day.clone());
    let appartment = TableCell::default().with_raw(day_data.appartment.clone());

    let day_attrs = if day_data.day == "So" {
        "fs-7 day sunday"
    } else {
        "fs-7 day"
    };

    let date_attrs = if day_data.day == "So" {
        "fs-7 date sunday"
    } else {
        "fs-7 date"
    };

    let row = TableRow::new()
        .with_cell(date.with_attributes([("class", date_attrs)]))
        .with_cell(day.with_attributes([("class", day_attrs)]))
        .with_cell(appartment.with_attributes([("class", "fs-7 apartment")]));
    if day_data.is_holiday {
        row.with_attributes([("class", "table-info")])
    } else {
        row
    }
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
        row.with_cell(
            TableCell::new(TableCellType::Data).with_table(
                create_month_table(data)
                    .with_attributes([("class", "table table-sm table-striped striped")])
                    .with_custom_header_row(
                        TableRow::new().with_cell(
                            TableCell::new(TableCellType::Header)
                                .with_raw(types::month_to_string(current_month))
                                .with_attributes([("class", "fs-7"), ("colspan", "3")]),
                        ),
                    ),
            ),
        )
    })
}

pub fn create_year_html(config: &types::Config, year_map: &YearMap, year: u16) -> String {
    let YearMap(map) = year_map;
    let mut month_data_vec: Vec<(&i8, &Vec<DayHTMLData>)> = map.iter().collect();
    month_data_vec.sort_by_key(|(y, _)| **y);
    let month_triples: Vec<Vec<(&i8, &Vec<DayHTMLData>)>> =
        month_data_vec.chunks(3).map(|x| x.to_vec()).collect();

    let table = month_triples
        .iter()
        .fold(Table::new(), |table, triple| {
            table.with_custom_body_row(create_month_row(triple))
        })
        .with_attributes([("class", "table table-sm table-borderless mb-0")]);
    HtmlPage::new()
        .with_html(
            HtmlElement::new(build_html::HtmlTag::Heading5)
                .with_child(
                    HtmlElement::new(build_html::HtmlTag::Span)
                        .with_attribute("id", "house-name")
                        .with_raw(config.title.clone())
                        .into(),
                )
                .with_child(
                    HtmlElement::new(build_html::HtmlTag::Span)
                        .with_attribute("id", "year")
                        .with_raw(year)
                        .into(),
                ),
        )
        .with_table(table)
        .to_html_string()
}
