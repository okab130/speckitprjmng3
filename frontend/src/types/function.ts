export interface Function {
  id: string;
  system_name: string;
  function_name: string;
  function_detail: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFunctionDto {
  system_name: string;
  function_name: string;
  function_detail: string;
}
