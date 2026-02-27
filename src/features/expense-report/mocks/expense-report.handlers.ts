import { delay, http, HttpResponse } from "msw";
import { expenseReportMock } from "./expense-report.mock";

export const expenseReportHandlers = [
  http.post("*/expense-report", async () => {
    await delay(500);
    // In a real scenario, you'd filter this based on the request body
    return HttpResponse.json(expenseReportMock);
  }),
];