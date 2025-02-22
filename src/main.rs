use tokio::runtime::Runtime;

pub mod types;
pub mod html;
pub mod holidays;

fn main() {
    let rt = Runtime::new().unwrap();

    let year: u16 = 2025;
    let exclude_sunday: bool = true;
    let apartment_info 
            = types::ApartmentInfo
            { current_floor: 2
            , position: types::FloorPosition::Middle
            , days_left: 0 };

    let countries = rt.block_on(holidays::get_countries()).unwrap();
    let (switzerland_iso, canton_map) = countries.get("Schweiz").unwrap();
    let nidwalden_iso = canton_map.as_ref().unwrap().get("Nidwalden").unwrap();
    let cfg_and_apartment = 
            types::config_from_file("./resources/sample_config.json")
                .and_then(|config| 
                    types::Apartment::new(&config, &apartment_info, &config.position_map)
                        .map(|apartment| (config, apartment)));

    match cfg_and_apartment {
        Ok((config, last_apartment)) => {
            let holidays = 
                rt.block_on(holidays::get_holidays(
                    year,
                    switzerland_iso.alpha2.to_string(),
                    nidwalden_iso.to_string()))
                .unwrap();
            let year_map = types::create_full_year(&config, year, last_apartment, exclude_sunday, &holidays);

            html::create_year_html(&config, &year_map).unwrap();
        }
        Err(err) => println!("Error: {}", err)
    }
}
