/**
 * Standardized response data object.
 */
export default class ResponseData {
  constructor(public error: boolean, public message: string, public data?: any) {}
}
