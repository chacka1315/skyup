export interface ApiError {
  message: string;
  code: string;

  //detail come from Pydantic as string or table  of errors
  detail:
    | { loc: string[]; msg: string; type: string; input: string }[]
    | string;
}
