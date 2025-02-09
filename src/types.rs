use datetime::{DatePiece, LocalDate, Month, Weekday};
use serde::{Deserialize, Serialize};
use std::{collections::{BTreeMap, HashMap}, error::Error, fmt::{self, Debug}};

#[derive(Deserialize, Serialize)]
pub struct Config {
    pub position_map: HashMap<u32, FloorInfo>,
    pub title: String
}

#[derive(Debug)]
pub enum ValidationError {
    FloorInfoError(FloorInfoError),
    FloorSkipped(u32),
    FormatError(serde_json::Error)
}

impl Error for ValidationError{}

impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::FloorInfoError(err) => fmt::Display::fmt(err, f),
            Self::FloorSkipped(floor) => 
                write!(f, "Invalid config! Floor {} was skipped in the config.", floor),
            Self::FormatError(err) => fmt::Display::fmt(err, f)
        }
    }
}

fn validate_config(cfg: &Config) -> Result<(), ValidationError> {
    let position_map = &cfg.position_map;
    let mut i;
    if position_map.contains_key(&0) {
        i = 0;
    } else {
        i = 1;
    }
    for (floor, value) in position_map.iter() {
        if !position_map.contains_key(&i) {
            return Err(ValidationError::FloorSkipped(i));
        }
        i += 1;

        if let Err(err) = value.validate(*floor) {
            return Err(ValidationError::FloorInfoError(err));
        }
    }
    Ok(())
}

pub fn config_from_file<P>(path: P) -> Result<Config, ValidationError>
    where P: AsRef<std::path::Path> {
    let file = std::fs::File::open(path).unwrap();
    let reader = std::io::BufReader::new(file);
    let config = match serde_json::from_reader(reader) {
        Ok(cfg) => cfg,
        Err(err) => return Err(ValidationError::FormatError(err)) 
    };
    validate_config(&config)?;
    Ok(config)
}

pub fn save_config<P>(config: Config, path: P) -> std::io::Result<()>
    where P: AsRef<std::path::Path> {
    let content = serde_json::to_string_pretty(&config)?;
    std::fs::write(path, content)
}

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
struct DayState {
    days_left: u8,
    days_total: u8
}

impl DayState {
    fn new(days_total: u8) -> DayState {
        DayState{ days_left: days_total, days_total }
    }

    fn next(&self) -> DayState {
        if self.days_left == 0 {
            return DayState{ days_total: self.days_total, days_left: self.days_total };
        }
        DayState{ days_left: self.days_left - 1 , days_total: self.days_total }
    }

    // NOTE: max means here that there are no days left
    fn is_max(&self) -> bool {
        0 == self.days_left
    }
}

#[derive(Copy, Clone, Debug)]
struct CurrentFloorState {
    floor_position: FloorPosition,
    day_state: DayState
}

impl CurrentFloorState {
    fn new(pos: FloorPosition, days_total: u8) -> CurrentFloorState {
        CurrentFloorState 
        { floor_position: pos
        , day_state: DayState::new(days_total)
        }
    }

    fn next(&self) -> CurrentFloorState {
        CurrentFloorState{ floor_position: self.floor_position, day_state: self.day_state.next() }
    }

    fn is_max(&self) -> bool {
        self.day_state.is_max()
    }

    fn print(&self) -> String {
        self.floor_position.print()
    }
}

#[derive(Debug)]
pub struct FloorInfoError {
    floor: u32,
    position: Option<FloorPosition>
}

impl Error for FloorInfoError{}

impl fmt::Display for FloorInfoError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Invalid FloorInfo for floor: {}, \
                   position: {:?}. Each apartment needs to have at least one day.",
               self.floor, self.position)
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct SingleApartmentFloorInfo {
    pub days_total: u8,
}

impl SingleApartmentFloorInfo {
    fn validate(&self, floor: u32) -> Result<(), FloorInfoError> {
        if self.days_total == 0 {
            return Err(FloorInfoError { floor, position: None });
        }
        Ok(())
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct TwoApartmentFloorInfo {
    pub left_days_total: u8,
    pub right_days_total: u8,
}

impl TwoApartmentFloorInfo {
    fn validate(&self, floor: u32) -> Result<(), FloorInfoError> {
        if self.left_days_total == 0 {
            return Err(FloorInfoError { floor, position: Some(FloorPosition::Left)});
        }
        if self.right_days_total == 0 {
            return Err(FloorInfoError { floor, position: Some(FloorPosition::Right)});
        }
        Ok(())
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct ThreeApartmentFloorInfo {
    pub left_days_total: u8,
    pub middle_days_total: u8,
    pub right_days_total: u8,
}

impl ThreeApartmentFloorInfo {
    fn validate(&self, floor: u32) -> Result<(), FloorInfoError> {
        if self.left_days_total == 0 {
            return Err(FloorInfoError { floor, position: Some(FloorPosition::Left)});
        }
        if self.middle_days_total == 0 {
            return Err(FloorInfoError { floor, position: Some(FloorPosition::Middle)});
        }
        if self.right_days_total == 0 {
            return Err(FloorInfoError { floor, position: Some(FloorPosition::Right)});
        }
        Ok(())
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum FloorInfo {
    OneApartment(SingleApartmentFloorInfo),
    TwoApartments(TwoApartmentFloorInfo),
    ThreeApartments(ThreeApartmentFloorInfo)
}

impl FloorInfo {
    fn validate(&self, floor: u32) -> Result<(), FloorInfoError> {
        match self {
            FloorInfo::OneApartment(ap) => ap.validate(floor),
            FloorInfo::TwoApartments(ap) => ap.validate(floor),
            FloorInfo::ThreeApartments(ap) => ap.validate(floor)
        }
    }
}

fn initial_appartment_position(floor_info: &FloorInfo) -> Position {
    match floor_info {
        FloorInfo::OneApartment(info) => 
            Position::SingleApartmentFloor(
                SingleApartmentFloorPos::new(info.days_total,
                                             info.days_total - 1)),
        FloorInfo::TwoApartments(info) => 
            Position::TwoApartmentFloor(
                TwoApartmentFloorPos::new_left(info.left_days_total,
                                               info.left_days_total - 1)),
        FloorInfo::ThreeApartments(info) => 
            Position::ThreeApartmentFloor(
                ThreeApartmentFloorPos::new_left(info.left_days_total,
                                                 info.left_days_total - 1))
    }   
}

fn create_position(floor_info: &FloorInfo,
                   floor_position: &FloorPosition,
                   days_left: u8) -> Option<Position> {
    match floor_info {
        FloorInfo::OneApartment(info) => {
            let position = SingleApartmentFloorPos::new(info.days_total, days_left);
            Some(Position::SingleApartmentFloor(position))
        },
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
                let position =
                        ThreeApartmentFloorPos::new_middle(info.middle_days_total, days_left);
                Some(Position::ThreeApartmentFloor(position))
            },
            FloorPosition::Right => {
                let position =
                        ThreeApartmentFloorPos::new_right(info.right_days_total, days_left);
                Some(Position::ThreeApartmentFloor(position))
            },
        }
    }
}

#[derive(Copy, Clone, Debug)]
pub struct SingleApartmentFloorPos {
    position: DayState
}

impl SingleApartmentFloorPos {
    fn new(days_total: u8, days_left: u8) -> SingleApartmentFloorPos {
        SingleApartmentFloorPos { position: DayState { days_left, days_total } }
    }

    fn next(&self) -> SingleApartmentFloorPos {
        SingleApartmentFloorPos { position: self.position.next() }
    }

    fn is_max(&self) -> bool {
        self.position.is_max()
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
                       , day_state: DayState{ days_left, days_total: days_total - 1 }
                       };
        TwoApartmentFloorPos { position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> TwoApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , day_state: DayState{ days_left, days_total: days_total - 1 }
                       };
        TwoApartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.is_max() {
                return true
        }
        false
    }

    fn next(&self, floor_info: &TwoApartmentFloorInfo) -> TwoApartmentFloorPos {
        let position = self.position;
        if position.is_max() {
            let (next_floor_position, days_total) = 
                if position.floor_position == FloorPosition::Left {
                    (FloorPosition::Right, floor_info.right_days_total - 1)
                } else {
                    (FloorPosition::Left, floor_info.left_days_total - 1)
                };
            let next_position = CurrentFloorState::new(next_floor_position, days_total);
            return TwoApartmentFloorPos{ position: next_position }
        }
        let next_position = self.position.next();
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
                       , day_state: DayState{ days_left, days_total: days_total - 1 }
                       };
        ThreeApartmentFloorPos{ position }
    }
    pub fn new_middle(days_total: u8, days_left: u8) -> ThreeApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Middle
                       , day_state: DayState{ days_left, days_total: days_total - 1 }
                       };
        ThreeApartmentFloorPos{ position }
    }
    pub fn new_right(days_total: u8, days_left: u8) -> ThreeApartmentFloorPos {
        let position = CurrentFloorState
                       { floor_position: FloorPosition::Right
                       , day_state: DayState{ days_left, days_total: days_total - 1 }
                       };
        ThreeApartmentFloorPos { position }
    }
    fn is_max(&self) -> bool {
        let position = self.position;
        if FloorPosition::Right == position.floor_position 
            && position.is_max() {
                return true
        }
        false
    }

    fn next(&self, floor_info: &ThreeApartmentFloorInfo) -> ThreeApartmentFloorPos {
        let position = self.position;
        if position.is_max() {
            let (next_floor_position, days_total) = match position.floor_position {
                FloorPosition::Left => 
                    (FloorPosition::Middle, floor_info.middle_days_total - 1),
                FloorPosition::Middle => 
                    (FloorPosition::Right, floor_info.right_days_total - 1),
                FloorPosition::Right => 
                    (FloorPosition::Left, floor_info.left_days_total - 1)
            };
            let next_position = CurrentFloorState::new(next_floor_position, days_total);
            return ThreeApartmentFloorPos{ position: next_position }
        }
        let next_position = self.position.next();
        ThreeApartmentFloorPos{ position: next_position }
    }

    fn print(&self) -> String {
        self.position.print()
    }
}

#[derive(Copy, Clone, Debug)]
pub enum Position {
    SingleApartmentFloor(SingleApartmentFloorPos),
    TwoApartmentFloor(TwoApartmentFloorPos),
    ThreeApartmentFloor(ThreeApartmentFloorPos)
}

impl Position {
    fn next(&self, floor_info: &FloorInfo) -> Option<Position> {
        match self {
            Position::SingleApartmentFloor(pos) => Some(Position::SingleApartmentFloor(pos.next())),
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
            Position::SingleApartmentFloor(pos) => pos.is_max(),
            Position::TwoApartmentFloor(pos) => pos.is_max(),
            Position::ThreeApartmentFloor(pos) => pos.is_max()
        }
    }

    fn print(&self) -> String {
        match self {
            Position::SingleApartmentFloor(_) => "".to_string(),
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
            let min = if self.has_ground_floor {
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
    current_floor: u32,
    max_floor: u32,
    position: FloorPosition,
    days_left: u8
}

impl ApartmentInfo {
    pub fn new(config: &Config,
               current_floor: u32,
               position: FloorPosition,
               days_left: u8) -> Option<ApartmentInfo> {
        let mut sorted_keys: Vec<&u32> = config.position_map.keys().collect();
        sorted_keys.sort_unstable();
        // NOTE: the initial config check ensures that the config isn't empty
        let max_floor = **sorted_keys.last().unwrap();
        if current_floor > max_floor {
            return None;
        }
        Some(ApartmentInfo { current_floor, max_floor , position , days_left })
    }
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
            // NOTE: The number of floors always matches the data in the position_map.
            // This is checked in the config validation.
            let floor_info = position_map.get(&next_floor.floor).unwrap();
            Apartment 
            { floor: next_floor
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
            Position::SingleApartmentFloor(_) => self.floor.print(),
            _ => format!("{}. {}", self.floor.print(), self.position.print())
        }
    }
}

#[derive(Debug)]
enum ApartmentOfDay {
    CurrentApartment(Apartment),
    LastApartment(Apartment, String)
}

impl ApartmentOfDay {
    fn extract_appartment(&self) -> &Apartment {
        match self {
            Self::CurrentApartment(app) => app,
            Self::LastApartment(app, _) => app
        }
    }

    fn print_appartment(&self) -> String {
        match self {
            Self::CurrentApartment(app) => app.print(),
            Self::LastApartment(_, reason) => reason.to_owned()
        }
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
    fn new(year: u16, 
           appartment: Apartment, 
           position_map: &HashMap<u32, FloorInfo>,
           exclude_sunday: bool,
           holidays: &BTreeMap<LocalDate, String>) -> Day {
        // This is safe b/c there is always at least one day per year
        
        let date = LocalDate::yd(year as i64, 1).unwrap();
        let appartment = create_appartment_of_day(date, appartment, position_map, exclude_sunday, holidays);
        Day { date, appartment }
    }

    pub fn next(&self,
                position_map: &HashMap<u32, FloorInfo>,
                exclude_sunday: bool, holidays: &BTreeMap<LocalDate, String>)
                -> Result<Day, Box<dyn Error>> {

        let current_year = self.date.year();
        let date = LocalDate::yd(current_year, self.date.yearday() as i64 + 1)?;

        if date.year() != current_year {
            let err = Box::new(WrongYearError);
            return Result::Err(err);
        }

        let app = self.appartment.extract_appartment().clone();
        let appartment =
                create_appartment_of_day(date, app, position_map, exclude_sunday, holidays);

        Ok(Day { date, appartment })
    }

    pub fn print(&self) -> String {
        [ print_local_date(self.date)
        , print_local_weekday(self.date)
        , self.appartment.print_appartment()
        ].join(" ")
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
    holidays: &BTreeMap<LocalDate, String>) -> ApartmentOfDay {

    match holidays.get(&date) {
        Some(holiday_name) => 
            // keep a stale value if the current day is not used
            ApartmentOfDay::LastApartment(last_appartment, holiday_name.to_owned()),
        None => {
            if exclude_sunday && date.weekday() == Weekday::Sunday {
                // keep a stale value if the current day is not used
                ApartmentOfDay::LastApartment(last_appartment, "".to_owned())
            } else {
                // go to the next appartment
                ApartmentOfDay::CurrentApartment(last_appartment.next(position_map))
            }
        }
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
    match month {
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
    }
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
    [day, month.to_owned()].join(".")
}

// @key months from january
// @value vector of appartment texts
#[derive(Debug)]
pub struct YearMap(pub HashMap<i8, Vec<DayHTMLData>>);

pub fn create_full_year(
    config: &Config,
    year: u16, 
    last_appartment: Apartment, 
    exclude_sunday: bool, 
    holidays: &BTreeMap<LocalDate, String>) -> YearMap {
    let mut year_map = HashMap::new();
    let mut current_day = 
                Day::new(year, last_appartment, &config.position_map, exclude_sunday, holidays);

    year_map.insert(current_day.date.month().months_from_january() as i8, 
                    vec![current_day.create_html_data()]);

    while let Ok(valid_day) = current_day.next(&config.position_map, exclude_sunday, holidays) {
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
