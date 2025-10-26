export class ApiResponse {
  constructor(
    statusCode,
    data = null,
    message = "Successfuly Done",
    success = null
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success !== null ? success : statusCode < 400;
  }
}
