/** Estrutura do índice do Manual gerado por scripts/build-manual-index.mjs. */
export type ManualOutlineItem = {
  title: string;
  page: number | null;
  children: ManualOutlineItem[];
};

export type ManualPageText = {
  page: number;
  text: string;
};

export type ManualIndex = {
  pdf: string;
  numPages: number;
  outline: ManualOutlineItem[];
  pages: ManualPageText[];
};
