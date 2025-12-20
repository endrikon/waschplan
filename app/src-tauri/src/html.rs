use std::error::Error;
use std::fs::File;
use std::io::Write;

use crate::types::{self, DayHTMLData, YearMap};
use build_html::{
    self, Html, HtmlContainer, HtmlElement, HtmlPage, Table, TableCell, TableCellType, TableRow,
};
use datetime::Month;

fn create_row(day_data: &DayHTMLData) -> TableRow {
    let date = TableCell::default().with_raw(day_data.date.clone());
    let day = TableCell::default().with_raw(day_data.day.clone());
    let appartment = TableCell::default().with_raw(day_data.appartment.clone());
    TableRow::new()
        .with_cell(date.with_attributes([("class", "fs-7 date")]))
        .with_cell(day.with_attributes([("class", "fs-7 day")]))
        .with_cell(appartment.with_attributes([("class", "fs-7 apartment")]))
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
                    .with_attributes([("class", "table table-sm table-striped")])
                    .with_custom_header_row(
                        TableRow::new().with_cell(
                            TableCell::new(TableCellType::Header)
                                .with_raw(types::month_to_string(current_month))
                                .with_attributes([("class", "fs-7")]),
                        ),
                    ),
            ),
        )
    })
}

pub fn create_year_html(
    config: &types::Config,
    year_map: &YearMap,
    year: u16,
) -> Result<(), Box<dyn Error>> {
    let path = format!("{}.html", config.title);
    let mut output = File::create(path)?;
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
        .with_attributes([("class", "table table-sm table-borderless")]);
    let page = HtmlPage::new()
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
        .with_style(
            r#"
            @page {
                margin-top: 0.75cm;
            }
            .fs-7 {
                font-size: 0.6rem;
                padding-top: 0px !important;
                padding-bottom: 0px !important;
            }
            .date {
                width: 10%;
                padding-right: 0cm !important;
                font-weight: bold;
            }
            .day {
                width: 20%;
                padding-right: 0cm !important;
            }
            .apartment {
                width: 70%;
            }
            #house-name {
                float: left;
            }
            #year {
                float: right;
            }"#,
        )
        .with_head_link(
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
            "stylesheet",
        )
        .with_table(table)
        .to_html_string();

    write!(output, "{}", page).map_err(|err| Box::new(err) as _)
}
