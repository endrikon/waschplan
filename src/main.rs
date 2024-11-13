#![allow(warnings)]
use std::collections::BTreeSet;
use datetime::LocalDate;
use types::{Appartment, Day, Floor, Position, ThreeAppartmentFloorPos, TwoAppartmentFloorPos};

pub mod types;

fn main() {
    let year:i64 = 2025;
    let exclude_sunday:bool = true;
    let holidays:BTreeSet<LocalDate> = BTreeSet::new();
    let floor = Floor::new(3);
    // let position = Position::SingleAppartmentFloor;
    let three_app_floor = ThreeAppartmentFloorPos::new_middle(2, 1);
    let two_app_floor = TwoAppartmentFloorPos::new_left(2, 1);
    let position = Position::ThreeAppartmentFloor(three_app_floor);
    let appartment = Appartment::new(floor, position);
    let day = Day::new(year, appartment, exclude_sunday, &holidays);

    let day2 = &day.next(exclude_sunday, &holidays).expect("");
    let day3 = &day2.next(exclude_sunday, &holidays).expect("");
    let day4 = &day3.next(exclude_sunday, &holidays).expect("");
    let day5 = &day4.next(exclude_sunday, &holidays).expect("");
    let day6 = &day5.next(exclude_sunday, &holidays).expect("");

    println!("Day1: {:?}", day.print());
    println!("Day2: {:?}", day2.print());
    println!("Day3: {:?}", day3.print());
    println!("Day4: {:?}", day4.print());
    println!("Day5: {:?}", day5.print());
    println!("Day6: {:?}", day6.print());
}
