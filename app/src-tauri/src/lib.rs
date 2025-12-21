use datetime::{DatePiece, LocalDate};
use std::collections::BTreeMap;
use tauri::Manager;

pub mod holidays;
pub mod html;
pub mod types;

#[tauri::command]
fn print_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.print().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Window not found".to_string())
    }
}

fn localdate_to_string(date: &LocalDate) -> String {
    format!("{}/{}/{}",
        date.year(),
        date.month().months_from_january() + 1,
        date.day())
}

#[tauri::command]
async fn get_holidays(
    year: u16,
    country_iso: String,
    subdivision_iso: String,
) -> Vec<(String, String)> {
    holidays::get_holidays(year, country_iso, subdivision_iso)
        .await
        .expect("Expected to get holidays")
        .iter()
        .map(|(date, holiday)| (localdate_to_string(date), holiday.to_owned()))
        .collect()
}

#[tauri::command]
fn get_subdivisions(country_iso: &str) -> Vec<(String, String)> {
    let iso = rust_iso3166::from_alpha2(country_iso).unwrap();
    match iso.subdivisions() {
        None => vec![],
        Some(subdivisions) => subdivisions
            .iter()
            .map(|subdivision| (subdivision.name.into(), subdivision.code.into()))
            .collect(),
    }
}

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
) -> String {
    // TODO: unwrapping is not so nice
    let holidays: BTreeMap<LocalDate, String> = holidays
        .iter()
        .map(|(key, value)| (string_to_local_date(key.as_str()).unwrap(), value.clone()))
        .collect();

    let last_apartment =
        types::Apartment::new(&config, &apartment_info, &config.position_map).unwrap();
    let year_map =
        types::create_full_year(&config, year, last_apartment, exclude_sunday, &holidays);

    html::create_year_html(&config, &year_map, year)
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
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_laundry_plan,
            get_subdivisions,
            get_holidays,
            print_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
