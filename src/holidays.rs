use std::{collections::BTreeMap, str::FromStr};
use serde::Deserialize;
use datetime::LocalDate;

#[derive(Deserialize, Debug)]
struct HolidayName {
    text: String
}

#[derive(Deserialize, Debug)]
#[allow(non_snake_case)]
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

pub async fn get_holidays(
        year: u16, 
        country_code: String, 
        division_code: String) -> reqwest::Result<BTreeMap<LocalDate, String>> {

    let valid_from = [&year.to_string(), "01-01"].join("-");
    let valid_to = [&year.to_string(), "12-31"].join("-");
    let url = [ "https://openholidaysapi.org/PublicHolidays?languageIsoCode=DE&countryIsoCode="
              , &country_code
              , "&validFrom="
              , &valid_from
              ,"&validTo="
              , &valid_to
              ,"&subdivisionCode="
              , &division_code].join("");
    let holidays: BTreeMap<LocalDate, String> = reqwest::get(url)
                .await.expect("Expected to get an output!")
                .json::<Vec<HolidayConstructor>>()
                .await.expect("Expected to get a list of json objects.")
                .iter()
                .map(convert_holiday)
                .map(|holiday| (holiday.date, holiday.name))
                .collect();

    reqwest::Result::Ok(holidays)
}

#[test]
pub fn read_holidays_from_file() {
    // Open the file in read-only mode with buffer.
    let file = std::fs::File::open("./resources/testJSON.json").unwrap();
    let reader = std::io::BufReader::new(file);
    let u: Vec<HolidayConstructor> = serde_json::from_reader(reader).expect("Possible to be parsed.");
    let holidays: Vec<Holiday> = u.iter().map(|x| convert_holiday(x)).collect();
    print!("{:?}", holidays);
}
