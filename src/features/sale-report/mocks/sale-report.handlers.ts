import { delay, http, HttpResponse } from "msw";
import { saleReportMock } from "./sale-report.mock";

export const saleReportHandlers = [
  http.post("*/sale-report", async () => {
    await delay(500);
    return HttpResponse.json(saleReportMock);
  }),
];