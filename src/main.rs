#![allow(warnings)]
use std::collections::{BTreeSet, HashMap};
use datetime::LocalDate;
use types::{create_full_year, Apartment, ApartmentInfo, Day, FloorInfo, Position, SingleApartmentFloorInfo, ThreeApartmentFloorInfo, ThreeApartmentFloorPos, TwoApartmentFloorInfo, TwoApartmentFloorPos, YearMap};

pub mod types;
pub mod html;

fn main() {
    let year:i64 = 2025;
    let exclude_sunday:bool = true;
    let holidays:BTreeSet<LocalDate> = BTreeSet::new();
    let single_app_floor_info = FloorInfo::OneApartment(SingleApartmentFloorInfo{ days_total: 1 });
    let three_app_floor_info = 
        FloorInfo::ThreeApartments(
            ThreeApartmentFloorInfo{left_days_total: 2, middle_days_total: 1, right_days_total: 2});
    let two_app_floor_info = 
        FloorInfo::TwoApartments(TwoApartmentFloorInfo{left_days_total: 2, right_days_total: 2});
    let position_map = HashMap::from([
                        (0, single_app_floor_info),
                        (1, three_app_floor_info.clone()),
                        (2, three_app_floor_info),
                        (3, two_app_floor_info)]);
    let appartment_info 
        = ApartmentInfo 
        { current_floor: 2
        , max_floor: 3
        , position: types::FloorPosition::Middle
        , days_left: 1
        };
    let last_appartment = Apartment::new(appartment_info, &position_map).unwrap();
    let year_map = create_full_year(year, last_appartment, &position_map, exclude_sunday, &holidays);
    html::create_year_html(&year_map);
}
