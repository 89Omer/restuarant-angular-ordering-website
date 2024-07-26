export class MyNotification {
  title: string;
  detail: string;
  time: string;
  colorclass?: string;

  constructor(title: string, detail: string, time: string) {
      this.title = title;
      this.detail = detail;
      this.time = time;
  }
}
