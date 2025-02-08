use types::{Apartment, ApartmentInfo};
use tokio::runtime::Runtime;

pub mod types;
pub mod html;
pub mod holidays;

fn main() {
    let rt = Runtime::new().unwrap();

    let year: u16 = 2025;
    let exclude_sunday: bool = true;
    let holidays = rt.block_on(holidays::get_holidays(year, "CH".to_string(), "CH-NW".to_string())).unwrap();
    let config = types::config_from_file("./resources/sample_config.json");
    let appartment_info 
        = ApartmentInfo 
        { current_floor: 2
        , max_floor: 3
        , position: types::FloorPosition::Middle
        , days_left: 1
        };
    let last_appartment = Apartment::new(appartment_info, &config.position_map).unwrap();
    let year_map = types::create_full_year(&config, year, last_appartment, exclude_sunday, &holidays);

    html::create_year_html(&year_map).unwrap();
}
