export interface CollectionOrder {
  [collectionName: string]: {
    /* Ascending */
    [columnName: string]: number[];
    // if sorted by more than one column then only equals need to be sorted by the subsequent column
  };
}
