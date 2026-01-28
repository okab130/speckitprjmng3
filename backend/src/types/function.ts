export interface Function {
  id: string;
  system_name: string;
  function_name: string;
  function_detail: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFunctionDto {
  system_name: string;
  function_name: string;
  function_detail: string;
}
