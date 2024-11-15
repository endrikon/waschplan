use datetime::{DatePiece, LocalDate, Month, Weekday, Year};
use std::{collections::{BTreeSet, HashMap}, error::Error, iter::Map};

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
enum FloorPosition {
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

#[derive(Copy, Clone, Debug)]
pub struct TwoAppartmentFloorPos {
    position: CurrentFloorState
}

impl TwoAppartmentFloorPos {
    pub fn new_left(days_total: u8, days_left: u8) -> TwoAppartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Left
                       , days_left
                       , days_total: days_total - 1
                       };
        TwoAppartmentFloorPos { position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> TwoAppartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , days_left
                       , days_total: days_total - 1
                       };
        TwoAppartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.days_left == 0 {
                return true
        }
        false
    }
    fn min_value(&self) -> TwoAppartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Left
            , days_left: self.position.days_total
            , days_total: self.position.days_total 
            };
            
        TwoAppartmentFloorPos { position }
    }
    fn max_value(&self) -> TwoAppartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Right
            , days_left: 0
            , days_total: self.position.days_total 
            };
            
        TwoAppartmentFloorPos { position }
    }
    fn next(&self) -> TwoAppartmentFloorPos {
        let position = self.position;
        if position.days_left == 0 {
            let next_floor_position = if position.floor_position == FloorPosition::Left {
                FloorPosition::Right
            } else {
                FloorPosition::Left
            };
            let next_position = CurrentFloorState
                                { floor_position: next_floor_position
                                , days_left: position.days_total
                                , days_total: position.days_total
                                };
            return TwoAppartmentFloorPos { position: next_position }
        }
        let next_position = CurrentFloorState
                            { floor_position: position.floor_position
                            , days_left: position.days_left - 1
                            , days_total: position.days_total
                            };
        TwoAppartmentFloorPos { position: next_position }
    }

    fn print(&self) -> String {
        self.position.print()
    }
}

#[derive(Copy, Clone, Debug)]
pub struct ThreeAppartmentFloorPos {
    position: CurrentFloorState
}

impl ThreeAppartmentFloorPos {
    pub fn new_left(days_total: u8, days_left: u8) -> ThreeAppartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Left
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeAppartmentFloorPos { position }
    }
    pub fn new_middle(days_total: u8, days_left: u8) -> ThreeAppartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Middle
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeAppartmentFloorPos { position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> ThreeAppartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , days_left
                       , days_total: days_total - 1
                       };
        ThreeAppartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.days_left == 0 {
                return true
        }
        false
    }
    fn min_value(&self) -> ThreeAppartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Left
            , days_left: self.position.days_total
            , days_total: self.position.days_total 
            };
            
        ThreeAppartmentFloorPos { position }
    }
    fn max_value(&self) -> ThreeAppartmentFloorPos {
        let position 
            = CurrentFloorState 
            { floor_position: FloorPosition::Right
            , days_left: 0
            , days_total: self.position.days_total 
            };
            
        ThreeAppartmentFloorPos { position }
    }
    fn next(&self) -> ThreeAppartmentFloorPos {
        let position = self.position;
        if position.days_left == 0 {
            let next_floor_position = match position.floor_position {
                FloorPosition::Left => FloorPosition::Middle,
                FloorPosition::Middle => FloorPosition::Right,
                FloorPosition::Right => FloorPosition::Left
            };
            let next_position = CurrentFloorState
                                { floor_position: next_floor_position
                                , days_left: position.days_total
                                , days_total: position.days_total
                                };
            return ThreeAppartmentFloorPos { position: next_position }
        }
        let next_position = CurrentFloorState
                            { floor_position: position.floor_position
                            , days_left: position.days_left - 1
                            , days_total: position.days_total
                            };
        ThreeAppartmentFloorPos { position: next_position }
    }

    fn print(&self) -> String {
        self.position.print()
    }
}

#[derive(Copy, Clone, Debug)]
pub enum Position {
    SingleAppartmentFloor,
    TwoAppartmentFloor(TwoAppartmentFloorPos),
    ThreeAppartmentFloor(ThreeAppartmentFloorPos)
}

impl Position {
    fn next(&self) -> Position {
        match self {
            Position::SingleAppartmentFloor => Position::SingleAppartmentFloor,
            Position::TwoAppartmentFloor(pos) => Position::TwoAppartmentFloor(pos.next()),
            Position::ThreeAppartmentFloor(pos) => Position::ThreeAppartmentFloor(pos.next())
        }
    }
    fn is_max(&self) -> bool {
        match self {
            Position::SingleAppartmentFloor => true,
            Position::TwoAppartmentFloor(pos) => pos.is_max(),
            Position::ThreeAppartmentFloor(pos) => pos.is_max()
        }
    }

    fn max_value(&self) -> Position {
        match self {
            Position::SingleAppartmentFloor => Self::SingleAppartmentFloor,
            Position::TwoAppartmentFloor(pos) => Self::TwoAppartmentFloor(pos.max_value()),
            Position::ThreeAppartmentFloor(pos) => Self::ThreeAppartmentFloor(pos.max_value())
        }
    }

    fn min_value(&self) -> Position {
        match self {
            Position::SingleAppartmentFloor => Self::SingleAppartmentFloor,
            Position::TwoAppartmentFloor(pos) => Self::TwoAppartmentFloor(pos.min_value()),
            Position::ThreeAppartmentFloor(pos) => Self::ThreeAppartmentFloor(pos.min_value())
        }
    }

    fn print(&self) -> String {
        match self {
            Position::SingleAppartmentFloor => "".to_string(),
            Position::TwoAppartmentFloor(pos) => pos.print(),
            Position::ThreeAppartmentFloor(pos) => pos.print(),
        }
    }
}

#[derive(Copy, Clone, Debug)]
pub struct Floor {
    max: u32,
    floor: u32
}

impl Floor {
    pub fn new(max: u32) -> Floor {
        Floor { floor: 0, max }
    }
    pub fn next(&self) -> Floor {
        if self.is_max() {
            Floor::new(self.max)
        } else {
            Floor { max: self.max, floor: self.floor + 1}
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

#[derive(Copy, Clone, Debug)]
pub struct Appartment {
    floor: Floor,
    position: Position
}

impl Appartment {
    pub fn new(floor: Floor, position: Position) -> Appartment {
        Appartment { floor, position }
    }

    pub fn next(&self) -> Appartment {
        if self.position.is_max() {
            //TODO: add some tests for edge cases 
            Appartment { floor: self.floor.next(), position: self.position.next() }
        } else {
            Appartment { floor: self.floor, position: self.position.next() }
        }
    }

    pub fn print(&self) -> String {
        match self.position {
            Position::SingleAppartmentFloor => self.floor.print(),
            _ => format!("{}. {}", self.floor.print(), self.position.print())
        }
    }
}

#[derive(Debug)]
enum AppartmentOfDay {
    CurrentAppartment(Appartment),
    LastAppartment(Appartment)    
}

impl AppartmentOfDay {
    fn extract_appartment(&self) -> &Appartment {
        match self {
            Self::CurrentAppartment(app) => app,
            Self::LastAppartment(app) => app
        }
    }

    fn print_appartment(&self) -> String {
        return match self {
            Self::CurrentAppartment(app) => app.print(),
            Self::LastAppartment(_) => "".to_owned()
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
    appartment: AppartmentOfDay,
}

impl Day {
    // @return first day of the year
    pub fn new(year: i64, 
           appartment: Appartment, 
           exclude_sunday: bool,
           holidays: &BTreeSet<LocalDate>) -> Day {
        // This is safe b/c there is always at least one day per year
        let date = LocalDate::yd(year, 1).unwrap();
        let appartment = create_appartment_of_day(date, appartment, exclude_sunday, &holidays);
        Day { date, appartment }
    }

    pub fn next(&self, exclude_sunday: bool, holidays: &BTreeSet<LocalDate>) -> Result<Day, Box<dyn Error>> {
        
        let date = LocalDate::yd(self.date.year(), self.date.yearday() as i64 + 1)?;
        let app = self.appartment.extract_appartment().clone();
        let appartment = create_appartment_of_day(date, app, exclude_sunday, holidays);

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
    last_appartment: Appartment, 
    exclude_sunday: bool, 
    holidays: &BTreeSet<LocalDate>) -> AppartmentOfDay {
    
    if (exclude_sunday && date.weekday() == Weekday::Sunday)
        || holidays.contains(&date) {
            // keep a stale value if the current day is not used
            AppartmentOfDay::LastAppartment(last_appartment)
    } else {
            // go to the next appartment
            AppartmentOfDay::CurrentAppartment(last_appartment.next())
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
pub struct YearMap(pub HashMap<usize, Vec<DayHTMLData>>);

pub fn create_full_year(
    year: i64, 
    last_appartment: Appartment, 
    exclude_sunday: bool, 
    holidays: &BTreeSet<LocalDate>) -> YearMap {
    let mut year_map = HashMap::new();
    let mut current_day = Day::new(year, last_appartment, exclude_sunday, holidays);

    year_map.insert(current_day.date.month().months_from_january(), 
                    vec![current_day.create_html_data()]);

    while let Ok(valid_day) = current_day.next(exclude_sunday, holidays) {
        let current_month = valid_day.date.month().months_from_january();
        if let Some(vector) = year_map.get_mut(&current_month) {
            vector.push(valid_day.create_html_data());
        } else {
            year_map.insert(current_month, vec![valid_day.create_html_data()]);
        }
        current_day = valid_day;
    };
    YearMap(year_map)
}
