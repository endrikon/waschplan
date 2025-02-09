use tokio::runtime::Runtime;

pub mod types;
pub mod html;
pub mod holidays;

fn main() {
    let rt = Runtime::new().unwrap();

    let year: u16 = 2025;
    let exclude_sunday: bool = true;

    match types::config_from_file("./resources/sample_config.json") {
        Ok(config) => {
            let holidays = rt.block_on(holidays::get_holidays(year, "CH".to_string(), "CH-NW".to_string())).unwrap();
            let appartment_info = types::ApartmentInfo::new(&config, 2, types::FloorPosition::Middle, 1)
                                    .expect("Current floor cannot be larger than max floor.");
            let last_appartment = types::Apartment::new(appartment_info, &config.position_map).unwrap();
            let year_map = types::create_full_year(&config, year, last_appartment, exclude_sunday, &holidays);

            html::create_year_html(&config, &year_map).unwrap();
        }
        Err(err) => println!("Error: {}", err)
    }
}
