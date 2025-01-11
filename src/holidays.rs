use std::{collections::{BTreeMap, HashMap}, error::Error, io::{stdout, Write}, str::FromStr};
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use serde::Deserialize;
use datetime::{DatePiece, LocalDate, LocalTime, Month, Weekday, Year};

#[derive(Deserialize, Debug)]
struct HolidayName {
    text: String
}

#[derive(Deserialize, Debug)]
struct HolidayConstructor {
    startDate: String,
    name: Vec<HolidayName>
}

#[derive(Debug)]
pub struct Holiday {
    date: LocalDate,
    name: String
}

fn convert_holiday(constructor: &HolidayConstructor) -> Holiday {
    let date = LocalDate::from_str(&constructor.startDate).unwrap();
    let name = constructor.name.first().unwrap().text.to_owned();
    Holiday { date, name }
}

pub async fn get_holidays(year: u16, country_code: String, division_code: String) -> reqwest::Result<BTreeMap<LocalDate, String>> {
    let validFrom = [&year.to_string(), "01-01"].join("-");
    let validTo = [&year.to_string(), "12-31"].join("-");
    let url = [ "https://openholidaysapi.org/PublicHolidays?languageIsoCode=DE&countryIsoCode="
              , &country_code
              , "&validFrom="
              , &validFrom
              ,"&validTo="
              , &validTo
              ,"&subdivisionCode="
              , &division_code].join("");
    let holidays: BTreeMap<LocalDate, String> = reqwest::get(url)
                .await.expect("Expected to get an output!")
                .json::<Vec<HolidayConstructor>>()
                .await.expect("Expected to get a list of json objects.")
                .iter()
                .map(|constructor| convert_holiday(constructor))
                .map(|holiday| (holiday.date, holiday.name))
                .collect();

    reqwest::Result::Ok(holidays)
}

#[test]
pub fn read_holidays_from_file() {
    // Open the file in read-only mode with buffer.
    let file = File::open("./resources/testJSON.json").unwrap();
    let reader = BufReader::new(file);
    let u: Vec<HolidayConstructor> = serde_json::from_reader(reader).expect("Possible to be parsed.");
    let holidays: Vec<Holiday> = u.iter().map(|x| convert_holiday(x)).collect();
    print!("{:?}", holidays);
}
