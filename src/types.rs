use datetime::{DatePiece, LocalDate, Month, Weekday, Year};
use num_traits::AsPrimitive;
use std::{collections::{BTreeSet, HashMap}, error::Error, fmt::{self, Debug}, iter::Map};

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum FloorPosition {
    Left,
    Middle,
    Right
}

impl FloorPosition {
    fn print(&self) -> String {
        match self {
            Self::Left => "Links".to_string(),
            Self::Middle => "Mitte".to_string(),
            Self::Right => "Rechts".to_string(),
        }
    }
}

#[derive(Copy, Clone, Debug)]
struct CurrentFloorState {
    floor_position: FloorPosition,
    days_left: u8,
    days_total: u8
}

impl CurrentFloorState {
    fn new(pos: FloorPosition, days_total: u8) -> CurrentFloorState {
        CurrentFloorState 
        { floor_position: pos
        , days_left: days_total
        , days_total 
        }
    }

    fn print(&self) -> String {
        self.floor_position.print()
    }
}

#[derive(Clone, Debug)]
pub struct TwoApartmentFloorInfo {
    pub left_days_total: u8,
    pub right_days_total: u8,
}

#[derive(Clone, Debug)]
pub struct ThreeApartmentFloorInfo {
    pub left_days_total: u8,
    pub middle_days_total: u8,
    pub right_days_total: u8,
}

#[derive(Clone, Debug)]
pub enum FloorInfo {
    OneApartment,
    TwoApartments(TwoApartmentFloorInfo),
    ThreeApartments(ThreeApartmentFloorInfo)
}

fn initial_appartment_position(floor_info: &FloorInfo) -> Position {
    match floor_info {
        FloorInfo::OneApartment => Position::SingleApartmentFloor,
        FloorInfo::TwoApartments(info) => 
            Position::TwoApartmentFloor(TwoApartmentFloorPos::new_left(info.left_days_total, info.left_days_total - 1)),
        FloorInfo::ThreeApartments(info) => 
            Position::ThreeApartmentFloor(ThreeApartmentFloorPos::new_left(info.left_days_total, info.left_days_total - 1))
    }   
}

fn create_position(floor_info: &FloorInfo, floor_position: &FloorPosition, days_left: u8) -> Option<Position> {
    match floor_info {
        FloorInfo::OneApartment => Some(Position::SingleApartmentFloor),
        FloorInfo::TwoApartments(info) => match floor_position {
            FloorPosition::Left => {
                let position = TwoApartmentFloorPos::new_left(info.left_days_total, days_left);
                Some(Position::TwoApartmentFloor(position))
            },
            FloorPosition::Right => {
                let position = TwoApartmentFloorPos::new_right(info.right_days_total, days_left);
                Some(Position::TwoApartmentFloor(position))
            },
            FloorPosition::Middle => None
        }
        FloorInfo::ThreeApartments(info) => match floor_position {
            FloorPosition::Left => {
                let position = ThreeApartmentFloorPos::new_left(info.left_days_total, days_left);
                Some(Position::ThreeApartmentFloor(position))
            },
            FloorPosition::Middle => {
                let position = ThreeApartmentFloorPos::new_middle(info.middle_days_total, days_left);
                Some(Position::ThreeApartmentFloor(position))
            },
            FloorPosition::Right => {
                let position = ThreeApartmentFloorPos::new_right(info.right_days_total, days_left);
                Some(Position::ThreeApartmentFloor(position))
            },
        }
    }
}

#[derive(Copy, Clone, Debug)]
pub struct TwoApartmentFloorPos {
    position: CurrentFloorState
}

impl TwoApartmentFloorPos {
    pub fn new_left(days_total: u8, days_left: u8) -> TwoApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Left
                       , days_left
                       , days_total: days_total - 1
                       };
        TwoApartmentFloorPos { position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> TwoApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , days_left
                       , days_total: days_total - 1
                       };
        TwoApartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.days_left == 0 {
                return true
        }
        false
    }
    fn min_value(&self) -> TwoApartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Left
            , days_left: self.position.days_total
            , days_total: self.position.days_total 
            };
            
        TwoApartmentFloorPos { position }
    }
    fn max_value(&self) -> TwoApartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Right
            , days_left: 0
            , days_total: self.position.days_total 
            };
            
        TwoApartmentFloorPos { position }
    }
    fn next(&self, floor_info: &TwoApartmentFloorInfo) -> TwoApartmentFloorPos {
        let position = self.position;
        if position.days_left == 0 {
            let (next_floor_position, days_left, days_total) = 
                if position.floor_position == FloorPosition::Left {
                    (FloorPosition::Right, floor_info.right_days_total - 1, floor_info.right_days_total - 1)
                } else {
                    (FloorPosition::Left, floor_info.left_days_total - 1, floor_info.left_days_total - 1)
                };
            let next_position = CurrentFloorState
                                { floor_position: next_floor_position
                                , days_left
                                , days_total
                                };
            return TwoApartmentFloorPos { position: next_position }
        }
        let next_position = CurrentFloorState
                            { floor_position: position.floor_position
                            , days_left: position.days_left - 1
                            , days_total: position.days_total
                            };
        TwoApartmentFloorPos { position: next_position }
    }

    fn print(&self) -> String {
        self.position.print()
    }
}

#[derive(Copy, Clone, Debug)]
pub struct ThreeApartmentFloorPos {
    position: CurrentFloorState
}

impl ThreeApartmentFloorPos {
    pub fn new_left(days_total: u8, days_left: u8) -> ThreeApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Left
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeApartmentFloorPos { position }
    }
    pub fn new_middle(days_total: u8, days_left: u8) -> ThreeApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Middle
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeApartmentFloorPos { position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> ThreeApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeApartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.days_left == 0 {
                return true
        }
        false
    }
    fn min_value(&self) -> ThreeApartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Left
            , days_left: self.position.days_total
            , days_total: self.position.days_total 
            };
            
        ThreeApartmentFloorPos { position }
    }
    fn max_value(&self) -> ThreeApartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Right
            , days_left: 0
            , days_total: self.position.days_total 
            };
            
        ThreeApartmentFloorPos { position }
    }
    fn next(&self, floor_info: &ThreeApartmentFloorInfo) -> ThreeApartmentFloorPos {
        let position = self.position;
        if position.days_left == 0 {
            let (next_floor_position, days_left, days_total) = match position.floor_position {
                FloorPosition::Left => 
                    (FloorPosition::Middle, floor_info.middle_days_total - 1, floor_info.middle_days_total - 1),
                FloorPosition::Middle => 
                    (FloorPosition::Right, floor_info.right_days_total - 1, floor_info.right_days_total - 1),
                FloorPosition::Right => 
                    (FloorPosition::Left, floor_info.left_days_total - 1, floor_info.left_days_total - 1)
            };
            let next_position = CurrentFloorState
                                { floor_position: next_floor_position
                                , days_left
                                , days_total
                                };
            return ThreeApartmentFloorPos { position: next_position }
        }
        let next_position = CurrentFloorState
                            { floor_position: position.floor_position
                            , days_left: position.days_left - 1
                            , days_total: position.days_total
                            };
        ThreeApartmentFloorPos { position: next_position }
    }

    fn print(&self) -> String {
        self.position.print()
    }
}

#[derive(Copy, Clone, Debug)]
pub enum Position {
    SingleApartmentFloor,
    TwoApartmentFloor(TwoApartmentFloorPos),
    ThreeApartmentFloor(ThreeApartmentFloorPos)
}

impl Position {
    fn next(&self, floor_info: &FloorInfo) -> Option<Position> {
        match self {
            Position::SingleApartmentFloor => Some(Position::SingleApartmentFloor),
            Position::TwoApartmentFloor(pos) => {
                if let FloorInfo::TwoApartments(info) = floor_info {
                    return Some(Position::TwoApartmentFloor(pos.next(info)))  
                }
                None
            },
            Position::ThreeApartmentFloor(pos) => {
                if let FloorInfo::ThreeApartments(info) = floor_info {
                    return Some(Position::ThreeApartmentFloor(pos.next(info)))   
                }
                None
            }
        }
    }
    fn is_max(&self) -> bool {
        match self {
            Position::SingleApartmentFloor => true,
            Position::TwoApartmentFloor(pos) => pos.is_max(),
            Position::ThreeApartmentFloor(pos) => pos.is_max()
        }
    }

    fn max_value(&self) -> Position {
        match self {
            Position::SingleApartmentFloor => Self::SingleApartmentFloor,
            Position::TwoApartmentFloor(pos) => Self::TwoApartmentFloor(pos.max_value()),
            Position::ThreeApartmentFloor(pos) => Self::ThreeApartmentFloor(pos.max_value())
        }
    }

    fn min_value(&self) -> Position {
        match self {
            Position::SingleApartmentFloor => Self::SingleApartmentFloor,
            Position::TwoApartmentFloor(pos) => Self::TwoApartmentFloor(pos.min_value()),
            Position::ThreeApartmentFloor(pos) => Self::ThreeApartmentFloor(pos.min_value())
        }
    }

    fn print(&self) -> String {
        match self {
            Position::SingleApartmentFloor => "".to_string(),
            Position::TwoApartmentFloor(pos) => pos.print(),
            Position::ThreeApartmentFloor(pos) => pos.print(),
        }
    }
}

#[derive(Copy, Clone, Debug)]
struct Floor {
    max: u32,
    has_ground_floor: bool,
    floor: u32
}

impl Floor {
    pub fn next(&self) -> Floor {
        if self.is_max() {
            let min = if (self.has_ground_floor) {
                        0
                      } else {
                            1
                      };
            Floor{ max: self.max, has_ground_floor: self.has_ground_floor, floor: min}
        } else {
            Floor{ max: self.max, has_ground_floor: self.has_ground_floor, floor: self.floor + 1 }
        }
    }
    pub fn print(&self) -> String {
        if self.floor == 0 {
            return "P".to_string()
        }
        self.floor.to_string()
    }
    fn is_max(&self) -> bool {
        self.floor == self.max
    }
}

#[derive(Clone, Debug)]
pub struct Apartment {
    floor: Floor,
    position: Position,
}

pub struct ApartmentInfo {
    pub current_floor: u32,
    pub max_floor: u32,
    pub position: FloorPosition,
    pub days_left: u8
}

impl Apartment {
    pub fn new(appartment_info: ApartmentInfo,
               position_map: &HashMap<u32, FloorInfo>) -> Option<Apartment> {
        let floor 
            = Floor
            { floor: appartment_info.current_floor
            , max: appartment_info.max_floor
            , has_ground_floor: position_map.contains_key(&0)
            };
        let info = position_map.get(&floor.floor)?;
        let position = create_position(info, &appartment_info.position, appartment_info.days_left)?;
        Some(Apartment{ floor, position })
    }

    pub fn next(&self, position_map: &HashMap<u32, FloorInfo>) -> Apartment {
        if self.position.is_max() {
            let next_floor = self.floor.next();
            let floor_info = position_map.get(&next_floor.floor).unwrap();
            Apartment 
            { floor: next_floor
            //TODO: unwrap can fail here if the hashmap doesn't have enough elements
            // find a way to make sure that the number of elements is equal to number of floors
            , position: initial_appartment_position(floor_info)
            }
        } else {
            let floor_info = position_map.get(&self.floor.floor).unwrap();
            Apartment 
            { floor: self.floor
            , position: self.position.next(floor_info).unwrap()
            }
        }
    }

    pub fn print(&self) -> String {
        match self.position {
            Position::SingleApartmentFloor => self.floor.print(),
            _ => format!("{}. {}", self.floor.print(), self.position.print())
        }
    }
}

#[derive(Debug)]
enum ApartmentOfDay {
    CurrentApartment(Apartment),
    LastApartment(Apartment)    
}

impl ApartmentOfDay {
    fn extract_appartment(&self) -> &Apartment {
        match self {
            Self::CurrentApartment(app) => app,
            Self::LastApartment(app) => app
        }
    }

    fn print_appartment(&self) -> String {
        return match self {
            Self::CurrentApartment(app) => app.print(),
            Self::LastApartment(_) => "".to_owned()
        };
    }
}

// container type for the data of a day
#[derive(Debug)]
pub struct DayHTMLData {
    pub date: String,
    pub day: String,
    pub appartment: String
}

#[derive(Debug)]
pub struct Day {
    date: LocalDate,
    appartment: ApartmentOfDay,
}

#[derive(Debug)]
struct WrongYearError;

impl Error for WrongYearError {}

impl fmt::Display for WrongYearError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Error: The year changed.")
    }
}

impl Day {
    // @return first day of the year
    pub fn new(year: i64, 
           appartment: Apartment, 
           position_map: &HashMap<u32, FloorInfo>,
           exclude_sunday: bool,
           holidays: &BTreeSet<LocalDate>) -> Day {
        // This is safe b/c there is always at least one day per year
        
        let date = LocalDate::yd(year, 1).unwrap();
        let appartment = create_appartment_of_day(date, appartment, position_map, exclude_sunday, &holidays);
        Day { date, appartment }
    }

    pub fn next(&self, position_map: &HashMap<u32, FloorInfo>, exclude_sunday: bool, holidays: &BTreeSet<LocalDate>) -> Result<Day, Box<dyn Error>> {

        let current_year = self.date.year();
        let date = LocalDate::yd(current_year, self.date.yearday() as i64 + 1)?;

        if date.year() != current_year {
            let err = Box::new(WrongYearError);
            return Result::Err(err);
        }

        let app = self.appartment.extract_appartment().clone();
        let appartment = create_appartment_of_day(date, app, position_map, exclude_sunday, holidays);

        Ok(Day { date, appartment })
    }

    pub fn print(&self) -> String {
        [print_local_date(self.date), print_local_weekday(self.date), self.appartment.print_appartment()].join(" ")
    }

    pub fn create_html_data(&self) -> DayHTMLData {
        DayHTMLData 
        { date: print_local_date(self.date)
        , day: print_local_weekday(self.date)
        , appartment:  self.appartment.print_appartment()
        }
    }
}

fn create_appartment_of_day(
    date: LocalDate,
    last_appartment: Apartment, 
    position_map: &HashMap<u32, FloorInfo>,
    exclude_sunday: bool, 
    holidays: &BTreeSet<LocalDate>) -> ApartmentOfDay {
    
    if (exclude_sunday && date.weekday() == Weekday::Sunday)
        || holidays.contains(&date) {
            // keep a stale value if the current day is not used
            ApartmentOfDay::LastApartment(last_appartment)
    } else {
            // go to the next appartment
            ApartmentOfDay::CurrentApartment(last_appartment.next(position_map))
    }
}

fn print_local_weekday(date: LocalDate) -> String {
    let weekday = match date.weekday() {
        Weekday::Sunday => "So",
        Weekday::Monday => "Mo",
        Weekday::Tuesday => "Di",
        Weekday::Wednesday => "Mi",
        Weekday::Thursday => "Do",
        Weekday::Friday => "Fr",
        Weekday::Saturday => "Sa"
    };
    weekday.to_string()
}

pub fn month_to_string(month: Month) -> String {
    return match month {
        datetime::Month::January => "Januar".to_owned(),
        datetime::Month::February => "Februar".to_owned(),
        datetime::Month::March => "März".to_owned(),
        datetime::Month::April => "April".to_owned(),
        datetime::Month::May => "Mai".to_owned(),
        datetime::Month::June => "Juni".to_owned(),
        datetime::Month::July => "Juli".to_owned(),
        datetime::Month::August => "August".to_owned(),
        datetime::Month::September => "September".to_owned(),
        datetime::Month::October => "Oktober".to_owned(),
        datetime::Month::November => "November".to_owned(),
        datetime::Month::December => "Dezember".to_owned()
    };
}

fn print_local_date(date: LocalDate) -> String {
    let day = date.day().to_string();
    let month = match date.month() {
        datetime::Month::January => "1",
        datetime::Month::February => "2",
        datetime::Month::March => "3",
        datetime::Month::April => "4",
        datetime::Month::May => "5",
        datetime::Month::June => "6",
        datetime::Month::July => "7",
        datetime::Month::August => "8",
        datetime::Month::September => "9",
        datetime::Month::October => "10",
        datetime::Month::November => "11",
        datetime::Month::December => "12"
    };
    return [day, month.to_owned()].join(".");
}

// @key months from january
// @value vector of appartment texts
#[derive(Debug)]
pub struct YearMap(pub HashMap<i8, Vec<DayHTMLData>>);

pub fn create_full_year(
    year: i64, 
    last_appartment: Apartment, 
    position_map: &HashMap<u32, FloorInfo>,
    exclude_sunday: bool, 
    holidays: &BTreeSet<LocalDate>) -> YearMap {
    let mut year_map = HashMap::new();
    let mut current_day = Day::new(year, last_appartment, position_map, exclude_sunday, holidays);

    year_map.insert(current_day.date.month().months_from_january() as i8, 
                    vec![current_day.create_html_data()]);

    while let Ok(valid_day) = current_day.next(position_map, exclude_sunday, holidays) {
        let current_month = valid_day.date.month().months_from_january() as i8;
        if let Some(vector) = year_map.get_mut(&current_month) {
            vector.push(valid_day.create_html_data());
        } else {
            year_map.insert(current_month, vec![valid_day.create_html_data()]);
        }
        current_day = valid_day;
    };
    YearMap(year_map)
}
