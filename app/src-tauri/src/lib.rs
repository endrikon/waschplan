use datetime::LocalDate;
use std::collections::BTreeMap;
use tokio::runtime::Runtime;

pub mod holidays;
pub mod html;
pub mod types;

fn string_to_local_date(date_str: &str) -> Option<LocalDate> {
    let ymd: Vec<i64> = date_str
        .split('.')
        .filter_map(|char| char.parse().ok())
        .collect();
    match ymd.as_slice() {
        [day, month_num, year] => datetime::Month::from_one(*month_num as i8)
            .and_then(|month| LocalDate::ymd(*year, month, *day as i8))
            .ok(),
        _ => None,
    }
}

#[tauri::command]
fn create_laundry_plan(
    config: types::Config,
    year: u16,
    apartment_info: types::ApartmentInfo,
    holidays: BTreeMap<String, String>,
    exclude_sunday: bool,
) {
    // TODO: unwrapping is not so nice
    let holidays: BTreeMap<LocalDate, String> = holidays
        .iter()
        .map(|(key, value)| (string_to_local_date(key.as_str()).unwrap(), value.clone()))
        .collect();

    let last_apartment =
        types::Apartment::new(&config, &apartment_info, &config.position_map).unwrap();
    let year_map =
        types::create_full_year(&config, year, last_apartment, exclude_sunday, &holidays);

    html::create_year_html(&config, &year_map, year).unwrap();
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_laundry_plan])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
