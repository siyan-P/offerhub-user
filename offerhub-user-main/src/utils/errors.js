export class NetworkError extends Error {
  constructor(message = "Network Error") {
    super(message);
    this.name = "NetworkError";
  }
}
