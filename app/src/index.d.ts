declare global {
  interface Window {
    __TAURI__: any; // Define your custom property
  }
  interface BulmaCalendar {
    attach(selector: string, options?: any): any[];
    datePicker: any;
  }

  export const bulmaCalendar: BulmaCalendar;
}

declare module "bulmaCalendar" {
  interface BulmaCalendar {
    attach(selector: string, options?: any): any[];
    datePicker: any;
  }

  export const bulmaCalendar: BulmaCalendar;
  export default bulmaCalendar;
}

export {};
