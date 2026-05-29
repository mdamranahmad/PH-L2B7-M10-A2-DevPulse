// type to define issue request
export type TIssueCreate = {
  title: string;
  description: string;
  type: string;
  status?: string;
};

export type TIssueUpdate = {
  title?: string;
  description?: string;
  type?: string;
  status?: string;
};
