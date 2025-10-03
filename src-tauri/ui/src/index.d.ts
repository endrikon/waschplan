declare global {
  interface Window {
    __TAURI__: any; // Define your custom property
  }

  interface BulmaCalendar {
    attach(selector: string, options?: any): any[];
  }

  const bulmaCalendar: BulmaCalendar;
}

export {};
